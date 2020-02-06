#!/bin/bash

VERIFICATION_KEY_JSON="https://www.dropbox.com/s/gte22ujvd75fuij/verification_key.json?dl=1"
PROVING_KEY_BIN="https://www.dropbox.com/s/y8nxhe0d81ambb9/proving_key.bin?dl=1"
CIRCUIT_JSON="https://www.dropbox.com/s/94adwgb1x4dbhf3/circuit.json?dl=1"

CIRCUIT_JSON_PATH="semaphore/semaphorejs/build/circuit.json"
PROVING_KEY_BIN_PATH="semaphore/semaphorejs/build/proving_key.bin"
VERIFICATION_KEY_PATH="semaphore/semaphorejs/build/verification_key.json"

mkdir -p semaphore/semaphorejs/build

if [ ! -f "$CIRCUIT_JSON_PATH" ]; then
    echo "Downloading circuit.json"
    wget --quiet $CIRCUIT_JSON -O $CIRCUIT_JSON_PATH
fi

if [ ! -f "$PROVING_KEY_BIN_PATH" ]; then
    echo "Downloading proving_key.bin"
    wget --quiet $PROVING_KEY_BIN -O $PROVING_KEY_BIN_PATH
fi

if [ ! -f "$VERIFICATION_KEY_PATH" ]; then
    echo "Downloading verification_key.json"
    wget --quiet $VERIFICATION_KEY_JSON -O $VERIFICATION_KEY_PATH
fi
