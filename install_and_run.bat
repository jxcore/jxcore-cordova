@echo off
@rem The script automates creating cordova project and running on Windows platforms:
@rem See https://github.com/jxcore/jxcore-cordova/blob/master/install_and_run.md

@rem Save it into an empty folder and run.

@rem create project
call cordova create hello com.example.hello HelloWorld
cd hello

@rem get small downloader tool
jx install download-cli

@rem get plugin
echo Downloading the file. Please wait...
jx node_modules/download-cli/cli.js http://jxcordova.cloudapp.net/0.0.8/io.jxcore.node.jx

@rem downloader tool not needed any more
rm -rf ./node_modules

@rem unpack plugin
jx io.jxcore.node.jx

@rem replace original sample if given
IF [%1] NEQ [] (
  IF EXIST "io.jxcore.node\sample\%~1\www" (
    goto:SAMPLE_EXISTS
  ) else (
    goto:SAMPLE_DOES_NOT_EXIST
  )
)
goto:FINISH

:SAMPLE_DOES_NOT_EXIST
echo Incorrect sample folder 'io.jxcore.node\sample\%~1\www'.
set /p answer= Continue with default sample? [y/n]
IF /I %answer%== y (
  goto:FINISH
) else (
  goto:EXIT_NOW
)
goto:EXIT_NOW

:SAMPLE_EXISTS

    IF EXIST "io.jxcore.node\sample\%~1\www\jxcore\package.json" (
        @rem installing node modules if sample needs it
        cd "io.jxcore.node\sample\%~1\www\jxcore"
        jx install --autoremove ".*,*.md,*.MD"
        cd ../../../../../
    )

xcopy /I /Q /Y /R /E "io.jxcore.node\sample\%~1\www\*.*" "www\"
IF %ERRORLEVEL% == 0 (
  echo Copied 'io.jxcore.node\sample\%~1\www' sample successfully.
  goto:FINISH
) else (
  echo Could not copy 'io.jxcore.node\sample\%~1\www'
  goto:EXIT_NOW
)

:FINISH
@rem add plugin to the project
call cordova plugin add io.jxcore.node

@rem run on android
call cordova platforms add android
call cordova run android

@rem or run on ios
@rem call cordova platforms add ios
@rem call cordova run ios
goto:EXIT_NOW

:EXIT_NOW
cd ..
goto:eof

