#!/bin/sh

# Clean existing files if any
rm -rf /var/www/html/dagik
rm -rf angstrom_exploratorium

# Clone the repository https://github.com/cavenel/angstrom_exploratorium
git clone https://github.com/cavenel/angstrom_exploratorium
cd angstrom_exploratorium

# Install dependencies

apt install python3-pip libhidapi-libusb0 libxcb-xinerama0 xautomation -y

echo "Adding udev rules and reloading"
tee /etc/udev/rules.d/70-streamdeck.rules << EOF
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fd9", TAG+="uaccess"
EOF
udevadm trigger

# Install streamdeck with pip
pip install streamdeck  --break-system-packages --user

# Add "xserver-command=X -nocursor" to /usr/share/lightdm/lightdm.conf.d/50-xserver-command.conf
echo "xserver-command=X -nocursor" >> /usr/share/lightdm/lightdm.conf.d/50-xserver-command.conf

# Copy ./dagik folder to /var/www/html/dagik
cp -r ./dagik /var/www/html/

# Copy fullpageos.txt and splash.png to /boot/
cp fullpageos.txt /boot/
cp splash.png /boot/

# Add streamdeck_service.py as a service on boot
cp streamdeck_service.service /etc/systemd/system/
chmod 644 /etc/systemd/system/streamdeck_service.service
systemctl daemon-reload
systemctl enable streamdeck_service.service
systemctl start streamdeck_service.service
