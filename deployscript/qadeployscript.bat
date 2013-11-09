echo "substituting dev settings"
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/mode='local'/mode='qa'/g ..\war\static-resources\core\envvariables.js
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/\/static-resources\//\/built-static-resources\//g ../war/boilerplate.js
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/'fem.appcache'/'builtfem.appcache'/g ../war/index.html
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/\"static-resources\//\"built-static-resources\//g ../war/index.html
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/require.js/require.min.js/g ../war/index.html
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/1\.0/1\.0\.1/g ../war/builtfem.appcache






cd ..\r-js-optimizer\
call optimize.cmd
cd ..\deployscript\

call "C:\Users\vishwanath\Downloads\Compressed\appengine-java-sdk-1.8.3\appengine-java-sdk-1.8.3\bin\appcfg.cmd" update ../war

echo "Coming back to local"
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/mode='qa'/mode='local'/g ..\war\static-resources\core\envvariables.js
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/built-static-resources/static-resources/g ../war/boilerplate.js
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/'builtfem.appcache'/'fem.appcache'/g ../war/index.html
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/\"built-static-resources\//\"static-resources\//g ../war/index.html
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/1\.0\.1\.1\.1\.1\.1/1\.0/g ../war/builtfem.appcache
"C:\Program Files (x86)\GnuWin32\bin\sed" -ci s/require.min.js/require.js/g ../war/index.html

echo "Done"


echo "Cleaning up sed temporary files"
del sed*
del "../war/sed*"
echo "Done"