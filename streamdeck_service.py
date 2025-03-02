#!/usr/bin/env python3

import os
import threading
from subprocess import Popen, PIPE
import time
from PIL import Image
from StreamDeck.DeviceManager import DeviceManager
from StreamDeck.ImageHelpers import PILHelper

# Folder location of image assets used by this example.
ASSETS_PATH = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "streamdeck_assets"
)

# Initial brightness levels
INITIAL_BRIGHTNESS = 70
DIM_BRIGHTNESS = 40
OFF_BRIGHTNESS = 1

# Time thresholds
DIM_TIME = 60  # 60 seconds to dim
OFF_TIME = 5 * 60  # 5 minutes to turn off

# Global variable to track the last interaction time
last_interaction_time = time.time()
last_brightness = 0

display_env = os.environ.copy()
display_env["DISPLAY"] = ":0"

stop_event = threading.Event()

# Updates the current brightness based on the last interaction time
def update_brightness(deck):
    global last_interaction_time, last_brightness
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
    #current_brightness = deck.get_brightness()
    if last_brightness != desired_brightness:
        try:
            deck.set_brightness(desired_brightness)
            Popen(['xrandr', '--output', 'HDMI-1', '--brightness', str(desired_brightness / INITIAL_BRIGHTNESS)], env=display_env)
            Popen(['xrandr', '--output', 'HDMI-2', '--brightness', str(desired_brightness / INITIAL_BRIGHTNESS)], env=display_env)
            last_brightness = desired_brightness
        except Exception as e:
            print(f"Error updating brightness: {e}")
            stop_event.set()

def brightness_maintenance(deck):
    while not stop_event.is_set():
        try:
            update_brightness(deck)
        except Exception as e:
            print(f"Brightness thread error: {e}")
            stop_event.set()
        time.sleep(1)

def monitor_mouse_events():
    global last_interaction_time
    try:
        with open("/dev/input/mice", "rb") as fh:
            while not stop_event.is_set():
                fh.read(3)
                last_interaction_time = time.time()
    except FileNotFoundError:
        print("Mouse device not found. Ensure `/dev/input/mice` exists.")
        stop_event.set()
    except Exception as e:
        print(f"Mouse monitoring error: {e}")
        stop_event.set()

def keypress(key):
    try:
        # Get alphabetical letter (1=a, 2=b, etc.)
        letter = chr(key + 97)
        print(letter)
        Popen(['xte', '-x:0'], stdin=PIPE).communicate(input=f"key {letter}\n".encode('ascii'))
        Popen(["xdotool", "click", "1"], env=display_env)
    except Exception as e:
        print(f"Key press error: {e}")
        stop_event.set()

def set_key_image(deck, key, state):
    icon_name = os.path.join(ASSETS_PATH, f"icon_{key}.png")
    try:
        if not os.path.exists(icon_name):
            icon = PILHelper.create_key_image(deck)
        else:
            icon = Image.open(icon_name)
            # Convert icon from RGBA to RGB if necessary
            if icon.mode == "RGBA":
                icon = icon.convert("RGB")
        image = PILHelper.to_native_key_format(deck, icon)
        with deck:
            deck.set_key_image(key, image)
    except Exception as e:
        print(f"Error setting key image: {e}")
        stop_event.set()

# Prints key state change information, updates the key image and performs any
# associated actions when a key is pressed.
def key_change_callback(deck, key, state):
    global last_interaction_time

    # Print new key state
    #print("Deck {} Key {} = {}".format(deck.id(), key, state), flush=True)

    if state:
        # Reset the last interaction time
        last_interaction_time = time.time()
        # Set brightness to initial value when a key is pressed
        deck.set_brightness(INITIAL_BRIGHTNESS)
        keypress(key)
    
    # Update the key image based on the new key state.
    set_key_image(deck, key, state)


if __name__ == "__main__":
    try:
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

        # Start separate thread for monitoring mouse events
        threading.Thread(target=monitor_mouse_events, daemon=True).start()

        while not stop_event.is_set():
            time.sleep(1)

    except Exception as e:
        print(f"Main thread error: {e}")
        stop_event.set()

    finally:
        for deck in streamdecks:
            deck.close()
        print("Program terminated.")
