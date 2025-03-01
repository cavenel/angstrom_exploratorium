# Ångström Exploratorium - Planet display

This project uses [Dagik](https://www.dagik.net/) to display planets on a half globe.
It is installed on a Raspberry Pi using [FullPageOS](https://github.com/guysoft/FullPageOS).

A streamdeck is used to control the display, using the Python library [streamdeck](https://github.com/abcminiuser/python-elgato-streamdeck).

To configure the Rapsberry Pi:
- Install FullPageOS [following the instructions](https://github.com/guysoft/FullPageOS?tab=readme-ov-file#how-to-use-it).
- From your Raspberry Pi, run the script [`setup_script.sh`](setup_script.sh):
    ```bash
    sh <(curl -sSL https://raw.githubusercontent.com/cavenel/angstrom_exploratorium/refs/heads/main/setup_script.sh)
    ```
- Reboot the Raspberry Pi.