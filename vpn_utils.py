# vpn_utils.py
import os
import random
import time
import shutil
import requests
import psutil
import subprocess
import requests
import pathlib
from datetime import datetime
import pytz
from overseer import logger
logger = logger.getChild("vpn_utils")

# List of VPN processors for safe removal
PN_PROCESSES = {
    "openvpn.exe",
    "openvpnserv.exe",
    "openvpn-gui.exe",
    "openvpnconnect.exe",
    "protonvpn.exe",
    "protonvpnservice.exe",
    "protonvpn-update.exe",
    "protonvpntap.exe",
    "wireguard.exe",
    "wg-quick.exe",
    "openvpnserv2.exe",
    "openvpnservice.exe",
    "tap-windows.exe",
    "tun2socks.exe",
}

# === Constants and Settings ====
# Paths to VPN Directory and Data
PROJECT_ROOT = pathlib.Path(__file__).resolve().parent
USER_DATA_DIR = PROJECT_ROOT / 'user_data'
CONFIG_DIR = PROJECT_ROOT / 'configs'
CRASHPAD_DIR    = PROJECT_ROOT /'crashpad'
TEMP_AUTH_FILE  = os.path.join(CONFIG_DIR, "temp_auth.txt")
OPENVPN_PATH    = r"C:\YOUR\FOLDER\PATH\openvpn.exe"
POLL_INTERVAL = 0.25         # poll Interval in seconds
MAX_ATTEMPTS = 6             # Connecting attempts
TIMEOUT_SECONDS = 120        # VPN  initialization Timesout 
API_TIMEOUT_SECONDS = 5


class VPNClient:
    """VPN connection orchestrator"""
    def __init__(self, config_dir: str, openvpn_path: str, timeout: int = 60):
        self.config_dir = config_dir
        self.temp_auth = TEMP_AUTH_FILE
        self.openvpn_path = openvpn_path
        self.timeout = timeout
    
    def verify(self):
        """Step 1: Obtaining pre-VPN IP"""
        try:
            r = requests.get("http://ip-api.com/json/", timeout=2, proxies={'http': None, 'https': None})
            r.raise_for_status()
            data = r.json()
            if data.get('status') != 'success':
                raise RuntimeError(f"Error pre-VPN API: {data}")
            self.pre_ip = data.get('query')
            logger.info(f"pre-VPN IP: {self.pre_ip}")
        except Exception as e:
            logger.error(f"Error obtaining pre-VPN IP: {e}")
            raise
        return self.pre_ip

    def prepare(self):
        """Step 1: Cleaning processes, directories and generation of the Auth file"""
        logger.info("Step 2: environment preparation(cleanup + DNS + auth)")

        self._terminate_vpn_processes()
        logger.info("Step 2.1: finishing old VPN processes")

        self._clean_directories()
        logger.info("Step 2.2: cleaning temporary directories")

        subprocess.run(["ipconfig", "/flushdns"], capture_output=True)
        logger.info("Step 2.3: reset DNS-cache")

        self._kill_old_processes()
        logger.info("Step 2.4: kill old browser processes")

        self._create_auth_file()
        logger.info("Step 2.5: generating temp auth-file")

        logger.info("cleaning and preparation stage is completed")

        
    def connect(self) -> bool:

        # 1) Checking the presence of .OVPN files
        configs = [f for f in os.listdir(self.config_dir) if f.endswith('.ovpn')]
        if not configs:
            logger.error(f"[VPN] we have no .ovpn-files in {self.config_dir}")
            return False
        choice = random.choice(configs)
        config_path = os.path.join(self.config_dir, choice)
        logger.info(f"[VPN] configuration selected: {choice}")

        # 2) Establish main VPN settings
        cmd = [
            self.openvpn_path,
            "--config", config_path,
            "--auth-user-pass", self.temp_auth,
            "--redirect-gateway", "def1",          
            # "--route-nopull",                         # AN OPTION TO SWITCH OPERATING MODE TO MANUAL step-by-step onroute-nopull
            "--auth-nocache",
            "--dhcp-option", "DNS", "1.1.1.1",
            "--dhcp-option", "DNS", "1.0.0.1",
            "--block-outside-dns",
            "--pull-filter", "ignore", "route-ipv6",    # Ignore IPv6 push from server side.
            "--pull-filter", "ignore", "ifconfig-ipv6",
        ]
        logger.debug("[VPN] Launch command: %s", ' '.join(cmd))

        # 3) Starting the process
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        self.openvpn_process = proc
        start_time = time.time()
        for line in proc.stdout:
            logger.debug(f"[VPN] {line.strip()}")
            if "Initialization Sequence Completed" in line:
                logger.info("VPN is successfully connected(stdout)")
                # Stabilization of routes/DNS
                time.sleep(2.0)
                try:
                    # sanity-check external network without system proxy
                    requests.get("http://ip-api.com/json/", timeout=3, proxies={'http': None, 'https': None})
                except Exception:
                    logger.warning("[VPN] VPN tunnel is up, network is not ready yet - waiting 3 sec more")
                    time.sleep(3.0)
                subprocess.run(["ipconfig", "/flushdns"], check=False)
                try:
                    os.remove(self.temp_auth)
                except Exception:
                    pass
                return True
            if time.time() - start_time > TIMEOUT_SECONDS:
                proc.kill()
                logger.error(f"[VPN] VPN did not connect in {self.timeout}s")
                raise TimeoutError(f"VPN did not connect in {self.timeout}s")
        # If the output flow is closed without a successful message
        logger.error("[VPN] VPN process ended without connection")
        return False

    def post(self):
        """Step 4: Obtaining post-VPN IP"""
        self.post_ip = None
        for _ in range(MAX_ATTEMPTS):
            try:
                r = requests.get("http://ip-api.com/json/", timeout=API_TIMEOUT_SECONDS, proxies={'http': None, 'https': None})
                data = r.json()
                if data.get('status') == 'success':
                    self.post_ip = data.get('query')
                    logger.info(f"post-VPN IP: {self.post_ip}")

                    break
            except Exception:
                pass
            time.sleep(3)
        if not self.post_ip:
            raise RuntimeError("VPN didnt return post-IP")
        return {'post_vpn_ip': self.post_ip}
    
    def get_details(self):
        """Step 4: Request for the full json from the API and the forming country_data"""
        post_ip = self.post_ip

        response = requests.get(f"http://ip-api.com/json/{post_ip}", timeout=5, proxies={'http': None, 'https': None})

        data = response.json()
        if data.get('status') != 'success':
            raise RuntimeError(f"API Error: {data}")

        timezone = data.get("timezone", "UTC")
        latitude = float(data.get("lat", 0.0))
        longitude = float(data.get("lon", 0.0))

        # ISO-2 from ip-api has priority; data from TZ-map is fallback
        country_api = (data.get('countryCode') or '').upper()
        result = get_language_for_timezone(timezone, return_country=True)
        if not result or len(result) < 4:
            raise RuntimeError("get_language_for_timezone returned an invalid tuple")
        tz_country, languages, domain, offset_minutes = result
        country = country_api or tz_country
        if not country:
            country = "UNKNOWN"
        
        country_data = {
            "timezone": timezone,
            "offset_minutes": offset_minutes,
            "latitude": latitude,
            "longitude": longitude,
            "languages": languages,
            "domain": domain,
            "country": country,
        }

        return {
            "data":      data,
            "country_data": country_data,
        }

    def _create_auth_file(self):
        """
        Creates a temporary auth file for OpenVPN (or another VPN provider), taking login/password from PROTONVPN_USERNAME / PROTONVPN_PASSWORD environment variables.
        Usage:
        1) Recommended: set these environment variables before starting the process.
        2) Alternative: implement another way to transfer credentials
        Note: do not hardcode credentials in the code.
        """
        usr = os.getenv("PROTONVPN_USERNAME")
        pwd = os.getenv("PROTONVPN_PASSWORD")
        with open(self.temp_auth,'w') as f:
            f.write(f"{usr}\n{pwd}\n")
        logger.debug("temp auth file created: %s", self.temp_auth)
    
    def _cleanup(self):
        """Step 4: Removing the Auth file """
        logger.info("Step 4:Removing the Auth file")
        try:
            if os.path.exists(self.temp_auth):
                os.remove(self.temp_auth)
                logger.debug(f"temp auth file deleted during cleanup: {self.temp_auth}")
        except Exception as e:
                logger.warning(f"Failed to delete temp auth file in cleanup: {e}")
    
    def _terminate_vpn_processes(self):
        for proc in psutil.process_iter(['pid', 'name']):
            name = proc.info.get('name')
            if name and name.lower() in PN_PROCESSES:
                try:
                    proc.terminate()
                    proc.wait(2)
                    logger.debug("Terminated VPN process %s (PID %d)", name, proc.pid)
                except psutil.TimeoutExpired:
                    proc.kill()
                    logger.debug("Killed VPN process %s (PID %d)", name, proc.pid)
                except Exception as e:
                    logger.warning("Error killing %s (PID %d): %s", name, proc.pid, e)
        #We also terminate our OpenVPN process if it is still active
        if hasattr(self, 'openvpn_process') and getattr(self, 'openvpn_process'):
            try:
                op = self.openvpn_process
                if op.poll() is None:
                    op.terminate()
                    op.wait(timeout=2)
                    logger.debug("Terminated local OpenVPN process (PID %d)", op.pid)
            except Exception as e:
                logger.warning("Error terminating local OpenVPN process: %s", e)

    def _clean_directories(self):
        """
        Wipes browser USER_DATA_DIR (always) and CRASHPAD_DIR.
        """
        shutil.rmtree(CRASHPAD_DIR, ignore_errors=True)
        shutil.rmtree(USER_DATA_DIR, ignore_errors=True)
        os.makedirs(USER_DATA_DIR, exist_ok=True)
    
    def _kill_old_processes(self):
        now = time.time()
        for proc in psutil.process_iter(['pid', 'name', 'create_time']):
            name = proc.info.get('name')
            if not name:
                continue
            if now - proc.info.get('create_time', now) > 300 and name.lower() in (
                'chrome.exe', 'chromedriver.exe', 'tor.exe', 'cmd.exe'):
                proc.terminate()
        
def get_language_for_timezone(timezone, return_country=False):
    """Sets the country (by Timezone map), languages, domain and offset for the given timezone.
    Contract:
    return_country=True  → (country, languages, domain, offset_minutes)
    return_country=False → (languages, domain)
    """
    
    language_map = {
    "America/New_York":        {"languages": ["en-US"], "domain": "com"},
    "America/Los_Angeles":     {"languages": ["en-US"], "domain": "com"},
    "America/Sao_Paulo":       {"languages": ["pt-BR"], "domain": "com.br"},
    "Europe/London":           {"languages": ["en-GB"], "domain": "co.uk"},
    "Europe/Paris":            {"languages": ["fr-FR"], "domain": "fr"},
    "Europe/Berlin":           {"languages": ["de-DE"], "domain": "de"},
    "Europe/Vienna":           {"languages": ["de-AT"], "domain": "at"},
    "Europe/Zurich":           {"languages": ["de-CH"], "domain": "ch"},
    "Europe/Brussels":         {"languages": ["fr-BE"], "domain": "be"},
    "Europe/Luxembourg":       {"languages": ["fr-LU"], "domain": "lu"},
    "Europe/Madrid":           {"languages": ["es-ES"], "domain": "es"},
    "Europe/Rome":             {"languages": ["it-IT"], "domain": "it"},
    "Europe/Amsterdam":        {"languages": ["nl-NL"], "domain": "nl"},
    "Europe/Copenhagen":       {"languages": ["da-DK"], "domain": "dk"},
    "Europe/Prague":           {"languages": ["cs-CZ"], "domain": "cz"},
    "Europe/Budapest":         {"languages": ["hu-HU"], "domain": "hu"},
    "Europe/Warsaw":           {"languages": ["pl-PL"], "domain": "pl"},
    "Europe/Stockholm":        {"languages": ["sv-SE"], "domain": "se"},
    "Europe/Lisbon":           {"languages": ["pt-PT"], "domain": "pt"},
    "Europe/Tallinn":          {"languages": ["et-EE"], "domain": "ee"},
    "Europe/Riga":             {"languages": ["lv-LV"], "domain": "lv"},
    "Europe/Vilnius":          {"languages": ["lt-LT"], "domain": "lt"},
    "Europe/Athens":           {"languages": ["el-GR"], "domain": "gr"},
    "Europe/Belgrade":         {"languages": ["sr-RS"], "domain": "rs"},
    "Europe/Bratislava":       {"languages": ["sk-SK"], "domain": "sk"},
    "Europe/Ljubljana":        {"languages": ["sl-SI"], "domain": "si"},
    "Europe/Bucharest":        {"languages": ["ro-RO"], "domain": "ro"},
    "Europe/Malta":            {"languages": ["en-MT"], "domain": "com.mt"},
    "Europe/Helsinki":         {"languages": ["fi-FI"], "domain": "fi"},
    "Europe/Oslo":             {"languages": ["no-NO"], "domain": "no"},
    "Europe/Sofia":            {"languages": ["bg-BG"], "domain": "bg"},
    "Europe/Dublin":           {"languages": ["en-IE"], "domain": "ie"},
    "Europe/Tirane":           {"languages": ["sq-AL"], "domain": "al"},
    "Asia/Tokyo":              {"languages": ["ja-JP"], "domain": "co.jp"},
    "Asia/Hong_Kong":          {"languages": ["zh-HK"], "domain": "com.hk"},
    "Europe/Nicosia":          {"languages": ["el-CY"], "domain": "com.cy"},
    "Asia/Nicosia":            {"languages": ["el-CY"], "domain": "com.cy"},
    "Asia/Seoul":              {"languages": ["ko-KR"], "domain": "co.kr"},
    "Asia/Shanghai":           {"languages": ["zh-CN"], "domain": "com"},
    "Asia/Bangkok":            {"languages": ["th-TH"], "domain": "co.th"},
    "Europe/Zagreb":           {"languages": ["hr-HR"], "domain": "hr"},
    "Atlantic/Reykjavik":      {"languages": ["is-IS"], "domain": "is"},
    "Africa/Johannesburg":     {"languages": ["en-ZA"], "domain": "co.za"},
    "Australia/Sydney":        {"languages": ["en-AU"], "domain": "com.au"},
    "America/Toronto":         {"languages": ["en-CA"], "domain": "ca"},
    "America/Vancouver":       {"languages": ["en-CA"], "domain": "ca"},
    "America/Montreal":        {"languages": ["fr-CA"], "domain": "ca"},
    "America/Edmonton":        {"languages": ["en-CA"], "domain": "ca"},
    }

    # Default сountry_data and list of languages
    default_data = {"languages": ["en-GB"], "domain": "com"}
    data = language_map.get(timezone, default_data)
    languages = data.get("languages", ["en-GB"])
    domain = data.get("domain", "com")

    # # Strictly convert to a list (if it's a string)
    if isinstance(languages, str):
        languages = [languages]

    # # country: if not set - try with pytz
    country = None
    if not country:
        try:
            for cc, tz_list in pytz.country_timezones.items():
                if timezone in tz_list:
                    country = cc.upper()
                    break
        except Exception:
            country = None
    if not country:
        country = "UNKNOWN"

    # # UTC offset (minutes) — (aware, DST-safe)
    try:
        tz = pytz.timezone(timezone)
        now_utc = datetime.now(pytz.utc)
        offset = now_utc.astimezone(tz).utcoffset()
        offset_minutes = int(offset.total_seconds() // 60) if offset else 0
    except Exception:
        offset_minutes = 0

    # # final contract for return
    if return_country:
        return country, languages, domain, offset_minutes
    return languages, domain

