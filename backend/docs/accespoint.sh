#!/bin/bash

sudo apt-get update && sudo apt-get upgrade -y
sudo apt install hostapd dnsmasq iptables usbmuxd -y

sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

# accespoint settings after download
echo -e "\ninterface wlan0\n static ip_address=192.168.220.1/24\n nohook wpa_supplicant" | sudo tee -a /etc/dhcpcd.conf
sudo systemctl restart dhcpcd

# Configure the access point
sudo tee /etc/hostapd/hostapd.conf <<EOF
interface=wlan0
driver=nl80211

hw_mode=g
channel=6
ieee80211n=1
wmm_enabled=0
macaddr_acl=0
ignore_broadcast_ssid=0

auth_algs=1
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP

ssid=eyf-team-05
wpa_passphrase=eyf-team-05
EOF


# Replace something in file
sudo sed -i 's/^#DAEMON_CONF=""/DAEMON_CONF="\/etc\/hostapd\/hostapd.conf"/' /etc/default/hostapd
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig

sudo tee /etc/dnsmasq.conf <<EOF
interface=wlan0       # Use interface wlan0
dhcp-range=192.168.220.50,192.168.220.150,12h # IP range and lease time  
EOF

# allow wlan to connect lan
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
sudo sh -c "echo 1 >  /proc/sys/net/ipv4/ip_forward"

# forward all connections to wlan
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

#saves rule above after restarting
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"

# Every restart executes te right scripts


SERVICE_NAME="my-eyf"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
COMMANDS="sudo hostapd /etc/hostapd/hostapd.conf &\niptables-restore < /etc/iptables.ipv4.nat"

# Check if the service file already exists
SERVICE_NAME="my-service"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
COMMANDS="sudo hostapd /etc/hostapd/hostapd.conf &\niptables-restore < /etc/iptables.ipv4.nat"

# Check if the service file already exists
if [ -f "$SERVICE_FILE" ]; then
    echo "Service file already exists. Skipping setup."
else
    # Create the service file
    echo "[Unit]" | sudo tee "$SERVICE_FILE" > /dev/null
    echo "Description=My Service" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "After=network.target" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "[Service]" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "ExecStart=/bin/bash -c '$COMMANDS'" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "[Install]" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "WantedBy=default.target" | sudo tee -a "$SERVICE_FILE" > /dev/null
    echo "Service file created."
fi

# Reload systemd to recognize the new service file
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl start "$SERVICE_NAME"

echo "Service set up and started."

# Reload systemd to recognize the new service file
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl start "$SERVICE_NAME"

echo "Service set up and started."

sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl start hostapd
sudo service dnsmasq start

