#!/bin/bash

PROVING_KEY_BIN="https://www.dropbox.com/s/qjlu6v125g7jkcq/proving_key.bin?dl=1"
CIRCUIT_JSON="https://www.dropbox.com/s/3gzxjibqgb6ke13/circuit.json?dl=1"

CIRCUIT_JSON_PATH="cache/circuit.json"
PROVING_KEY_BIN_PATH="cache/proving_key.bin"

mkdir -p cache

if [ ! -f "$CIRCUIT_JSON_PATH" ]; then
    echo "Downloading circuit.json"
    wget $CIRCUIT_JSON -O $CIRCUIT_JSON_PATH
fi

if [ ! -f "$PROVING_KEY_BIN_PATH" ]; then
    echo "Downloading proving_key.bin"
    wget $PROVING_KEY_BIN -O $PROVING_KEY_BIN_PATH
fi
