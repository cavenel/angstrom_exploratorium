#!/usr/bin/env python3

#         Python Stream Deck Library
#      Released under the MIT license
#
#   dean [at] fourwalledcubicle [dot] com
#         www.fourwalledcubicle.com
#

# Example script showing basic library usage - updating key images with new
# tiles generated at runtime, and responding to button state change events.

import os
import threading
from subprocess import Popen, PIPE
import time

from PIL import Image
from StreamDeck.DeviceManager import DeviceManager
from StreamDeck.ImageHelpers import PILHelper

# Folder location of image assets used by this example.
ASSETS_PATH = "/boot/streamdeck_assets"

# Initial brightness levels
INITIAL_BRIGHTNESS = 50
DIM_BRIGHTNESS = 25
OFF_BRIGHTNESS = 5

# Time thresholds
DIM_TIME = 30  # 30 seconds to dim
OFF_TIME = 5 * 60  # 5 minutes to turn off

# Global variable to track the last interaction time
last_interaction_time = time.time()

# Updates the current brightness based on the last interaction time
def update_brightness(deck):
    global last_interaction_time
    current_time = time.time()
    elapsed_time = current_time - last_interaction_time

    # Determine the desired brightness based on elapsed time
    if elapsed_time >= OFF_TIME:
        desired_brightness = OFF_BRIGHTNESS
    elif elapsed_time >= DIM_TIME:
        desired_brightness = DIM_BRIGHTNESS
    else:
        desired_brightness = INITIAL_BRIGHTNESS

    # Set the brightness if it's different from the current one
    current_brightness = deck.get_brightness()
    if current_brightness != desired_brightness:
        deck.set_brightness(desired_brightness)

# Periodically invoked function to update brightness
def brightness_maintenance(deck):
    while True:
        update_brightness(deck)
        time.sleep(1)  # Adjust the sleep time as needed

def keypress(key):
    p = Popen(['xte', '-x:0'], stdin=PIPE)
    p.communicate(input=f"key {key}".encode('ascii'))

# Returns styling information for a key based on its position and state.
def set_key_image(deck, key, state):
    icon_name = os.path.join(ASSETS_PATH, f"icon_{key}.png"),
    if not os.path.exists(icon_name):
        icon = PILHelper.create_key_image(deck)
    else:
        icon = Image.open(icon_name)
    image = PILHelper.to_native_key_format(deck, icon)
    with deck:
        deck.set_key_image(key, image)

# Prints key state change information, updates the key image and performs any
# associated actions when a key is pressed.
def key_change_callback(deck, key, state):
    global last_interaction_time

    # Print new key state
    print("Deck {} Key {} = {}".format(deck.id(), key, state), flush=True)

    if state:
        # Reset the last interaction time
        last_interaction_time = time.time()
        # Set brightness to initial value when a key is pressed
        deck.set_brightness(INITIAL_BRIGHTNESS)
        keypress(key)
    
    # Update the key image based on the new key state.
    set_key_image(deck, key, state)


if __name__ == "__main__":
    streamdecks = DeviceManager().enumerate()

    print("Found {} Stream Deck(s).\n".format(len(streamdecks)))

    for index, deck in enumerate(streamdecks):
        # This example only works with devices that have screens.
        if not deck.is_visual():
            continue

        deck.open()
        deck.reset()

        print("Opened '{}' device (serial number: '{}', fw: '{}')".format(
            deck.deck_type(), deck.get_serial_number(), deck.get_firmware_version()
        ))

        # Set initial brightness
        deck.set_brightness(INITIAL_BRIGHTNESS)

        # Set initial key images.
        for key in range(deck.key_count()):
            set_key_image(deck, key, False)

        # Register callback function for when a key state changes.
        deck.set_key_callback(key_change_callback)

        # Start separate thread for brightness maintenance
        threading.Thread(target=brightness_maintenance, args=(deck,), daemon=True).start()

        # Wait until all application threads have terminated (for this example,
        # this is when all deck handles are closed).
        for t in threading.enumerate():
            try:
                t.join()
            except RuntimeError:
                pass