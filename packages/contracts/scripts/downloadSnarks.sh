#!/bin/bash

PROVING_KEY_BIN="https://oneofus.blob.core.windows.net/snarks/proving_key.bin"
CIRCUIT_JSON="https://oneofus.blob.core.windows.net/snarks/circuit.json"

CIRCUIT_JSON_PATH="cache/circuit.json"
PROVING_KEY_BIN_PATH="cache/proving_key.bin"

mkdir -p cache

if [ ! -f "$CIRCUIT_JSON_PATH" ]; then
    echo "Downloading circuit.json"
    wget -O - $CIRCUIT_JSON | gunzip -c > $CIRCUIT_JSON_PATH
fi

if [ ! -f "$PROVING_KEY_BIN_PATH" ]; then
    echo "Downloading proving_key.bin"
    wget -O - $PROVING_KEY_BIN | gunzip -c > $PROVING_KEY_BIN_PATH
fi
