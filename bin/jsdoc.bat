@echo off
cd %0\..\..
echo running "jsdoc -d doc ui-components.js ui-components.md" ...
jsdoc -d doc ui-components.js ui-components.md

