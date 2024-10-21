#!/bin/sh

# Clean existing files if any
rm -rf /var/www/html/dagik
rm -rf /home/pi/streamdeck_assets
rm -f angstrom_exploratorium

# Clone the repository https://github.com/cavenel/angstrom_exploratorium
git clone https://github.com/cavenel/angstrom_exploratorium
cd angstrom_exploratorium

# Install dependencies

apt install python3-pip libhidapi-libusb0 libxcb-xinerama0

echo "Adding udev rules and reloading"
tee /etc/udev/rules.d/70-streamdeck.rules << EOF
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", TAG+="uaccess"
EOF
udevadm trigger

# Install streamdeck with pip
pip install streamdeck

# Add "xserver-command=X -nocursor" to /usr/share/lightdm/lightdm.conf.d/50-xserver-command.conf
echo "xserver-command=X -nocursor" >> /usr/share/lightdm/lightdm.conf.d/50-xserver-command.conf

# Copy ./dagik folder to /var/www/html/dagik
cp -r ./dagik /var/www/html/

# Copy fullpageos.txt and splash.png to /boot/
cp fullpageos.txt /boot/
cp splash.png /boot/

# Copy streamdeck_service.py to /home/pi/
cp streamdeck_service.py /home/pi/
cp -r streamdeck_assets /home/pi/

# Add streamdeck_service.py as a service on boot
cp streamdeck.service /etc/systemd/system/
chmod 644 /lib/systemd/system/streamdeck.service
chmod +x /home/pi/streamdeck_service.py
systemctl daemon-reload
systemctl enable streamdeck.service
systemctl start streamdeck.service
