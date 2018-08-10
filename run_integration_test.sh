#!/bin/bash
BASE_PATH=./integration

node transpile $BASE_PATH/src $BASE_PATH/target -c

for f in `ls $BASE_PATH/src`
do
    name=${f%.apex}
    diff $BASE_PATH/target/${name}.cls $BASE_PATH/benchmark/${name}.cls
    if [[ $? -ne 0 ]]; then
        echo 'Integration Test Failed'
        exit 1
    fi
done

echo 'Integration Test Succeeded'
