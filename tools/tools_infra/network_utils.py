# network_utils.py
import os
import time
import shutil
import requests
import psutil
import subprocess
import pathlib
from datetime import datetime
import pytz
from overseer import logger
logger = logger.getChild("network_utils")


# === Constants and Settings ====
PROJECT_ROOT        = pathlib.Path(__file__).resolve().parents[2]
USER_DATA_DIR       = PROJECT_ROOT / 'user_data'
MAX_ATTEMPTS        = 6             # Connecting attempts
API_TIMEOUT_SECONDS = 5


class Client:
    """connection orchestrator"""
    def __init__(self, timeout: int = 60):
        self.timeout = timeout

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
        """Step 4: Request the full json from the API and form country_data.

        `country_data["languages"]` remains a raw locale seed list here.
        Final canonicalization/base-language expansion is performed later by
        helpers.normalize_languages().
        """
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
            raise RuntimeError("get_language_for_timezone returned an invalid turple")
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
            "data": data,
            "country_data": country_data,
        }

    def _clean_directories(self):
        """
        Wipes browser USER_DATA_DIR
        """
        try:
            shutil.rmtree(USER_DATA_DIR, ignore_errors=True)
            logger.info("[cleanup] removed dir: %s", USER_DATA_DIR)
        except Exception as e:
            logger.debug("[cleanup] skip removing %s: %s", USER_DATA_DIR, e)

        os.makedirs(USER_DATA_DIR, exist_ok=True)
        logger.info("[cleanup] created dir: %s", USER_DATA_DIR)


    def _kill_old_processes(self):
        """cleanup of stale processes that can interfere with startup.

        Policy:
        - Never silently assume cleanup succeeded; log what was done.
        - Be conservative: only terminate browser processes that are clearly tied to this project
        (e.g. using our USER_DATA_DIR in the command line).
        """
        # Processes that are safe to terminate unconditionally if found.
        always_kill = {
            'chromedriver.exe',
            'geckodriver.exe',
            'tor.exe',
        }
        
        # Browser processes are only terminated if their cmdline points to our USER_DATA_DIR.
        browser_names = {
            'chrome.exe',
        }

        user_data_token = str(USER_DATA_DIR)

        for proc in psutil.process_iter(['pid', 'name', 'create_time', 'cmdline', 'exe']):
            try:
                name = (proc.info.get('name') or '').lower()
                if not name:
                    continue

                cmdline = ' '.join(proc.info.get('cmdline') or [])

                should_terminate = False
                if name in always_kill:
                    # These helper processes interfere with a clean run.
                    should_terminate = True
                elif name in browser_names:
                    # Be conservative: only terminate if this browser instance is using our project profile.
                    if user_data_token and (user_data_token in cmdline):
                        should_terminate = True

                if not should_terminate:
                    continue

                logger.info(
                    "[cleanup] terminating PID=%d name=%s exe=%s cmd=%s",
                    proc.pid,
                    name,
                    proc.info.get('exe'),
                    cmdline[:300]
                )

                proc.terminate()
                try:
                    proc.wait(timeout=2)
                except psutil.TimeoutExpired:
                    proc.kill()

            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
            except Exception as e:
                # Cleanup is best-effort here; do not crash the whole run from an unrelated PID.
                logger.debug("[cleanup] error terminating PID=%s: %s", getattr(proc, 'pid', '?'), e)

                        
def get_language_for_timezone(timezone, return_country=False):
    """Sets the country (by Timezone map), languages, domain and offset for the given timezone.
    Contract:
    return_country=True  → (country, languages, domain, offset_minutes)
    return_country=False → (languages, domain)

    `languages` here is a raw seed list for the locale pipeline.
    Final canonicalization and base-language expansion happen later in
    helpers.normalize_languages().
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
    "Europe/Moscow":           {"languages": ["ru-RU"], "domain": "ru"},
    "Europe/Volgograd":        {"languages": ["ru-RU"], "domain": "ru"},
    }

    # Default сountry_data and list of languages
    default_data = {"languages": ["en-GB"], "domain": "com"}
    data = language_map.get(timezone, default_data)
    languages = data.get("languages")
    domain = data.get("domain", "com")

    # Strictly convert to a list (if it's a string)
    if isinstance(languages, str):
        languages = [languages]

    # country: if not set - try with pytz
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

    #  UTC offset (minutes) — (aware, DST-safe)
    try:
        tz = pytz.timezone(timezone)
        now_utc = datetime.now(pytz.utc)
        offset = now_utc.astimezone(tz).utcoffset()
        offset_minutes = int(offset.total_seconds() // 60) if offset else 0
    except Exception:
        offset_minutes = 0

    #  final contract for return
    if return_country:
        return country, languages, domain, offset_minutes
    return languages, domain
