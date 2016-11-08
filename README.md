
# Running

VERBOSE=true ./index.js ~/my-project

./index.js ~/my-project -i '**/*.js' -i '**/*.jsx'
./index.js ~/my-project -i '**/*.js' -i '**/*.jsx' -x 'node_modules/**/*.js' -x '*/__tests__/**/*.js'

VERBOSE=true ./index.js -i '**/*.js' -i '**/*.jsx' -x 'node_modules/**/*.js' -x '*/__tests__/**/*.js'
VERBOSE=true ./index.js -i '**/*.js' -i '**/*.jsx' -x 'node_modules/**/*.js' -x '*/__tests__/**/*.js'


VERBOSE=true ./index.js -i 'src/__tests__/fixtures/*.js'
