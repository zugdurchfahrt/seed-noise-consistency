import os
import sys
import logging
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).resolve().parent

class Overseer:
    """
    Redirects sys.stdout или sys.stderr to Logger.
    """
    def __init__(self, logger, level):
        self.logger = logger
        self.level = level

    def write(self, buf):
        if buf.rstrip():
            for line in buf.rstrip().splitlines():
                self.logger.log(self.level, line.rstrip())

    def flush(self):
        pass
    
    
def setup_logger(child_levels=None):
    """
    The centralized Logger setting for all modules.
    You can set levels for modules through child_levels.
    """
    logger = logging.getLogger("intention_entitled")
    if not logger.hasHandlers():
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
        )

        log_file_path = PROJECT_ROOT / 'logs' / 'intention_entitled.log'
        os.makedirs(log_file_path.parent, exist_ok=True)

        # FileHandler To log in the file
        fh = logging.FileHandler(log_file_path, encoding="utf-8")
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        # --- Proxy child logger ---
        proxy_log_file = PROJECT_ROOT / 'logs' / 'proxy_full.log'
        proxy_fh = logging.FileHandler(proxy_log_file, encoding="utf-8")
        proxy_fh.setLevel(logging.INFO)
        proxy_fh.setFormatter(formatter)

        proxy_logger = logger.getChild("proxy")
        proxy_logger.setLevel(logging.INFO)
        proxy_logger.addHandler(proxy_fh)
        
        # StreamHandler To log in the console
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        ch.setFormatter(formatter)
        logger.addHandler(ch)

        logger.setLevel(logging.DEBUG)
        logger.debug(f"Logger initialized, logging to: {log_file_path}")

        # We redirect stdout и stderr to Logger
        sys.stdout = Overseer(logger, logging.INFO)
        sys.stderr = Overseer(logger, logging.INFO)

    # set child_levels
    if child_levels:
        for name, level in child_levels.items():
            logger.getChild(name).setLevel(level)

    return logger

# Экспортируем всё необходимое
logger = setup_logger()



""" 
Уровни логирования в Python logging
Уровень	Число (value)	Пример метода	Описание
CRITICAL	50	logger.critical()	Критическая ошибка, срочно!
ERROR	40	logger.error()	Ошибка, но не краш
WARNING	30	logger.warning()	Предупреждение, алерт
INFO	20	logger.info()	Информационное событие
DEBUG	10	logger.debug()	Подробный debug/отладка
NOTSET	0	-	“Без фильтра”, всё проходит

Табличка актуальна для любого стандартного логгера, включая child-логгеры! """