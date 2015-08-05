@echo off
@rem The script automates creating cordova project and running on Windows platforms:
@rem See https://github.com/jxcore/jxcore-cordova/blob/master/install_and_run.md

@rem Save it into an empty folder and run.

@rem create project
call cordova create hello com.example.hello HelloWorld
cd hello

@rem get plugin
call git clone https://github.com/jxcore/jxcore-cordova

@rem replace original sample if given
IF [%1] NEQ [] (
    IF EXIST "jxcore-cordova\sample\%~1\www" (
		goto:SAMPLE_EXISTS
    ) else (
		goto:SAMPLE_DOES_NOT_EXIST
    )
)
goto:FINISH

:SAMPLE_DOES_NOT_EXIST
echo Incorrect sample folder 'jxcore-cordova\sample\%~1\www'.
set /p answer= Continue with default sample? [y/n]
IF /I %answer%== y (
	goto:FINISH
) else (
	goto:EXIT_NOW
)
goto:EXIT_NOW

:SAMPLE_EXISTS
xcopy /I /Q /Y /R /E "jxcore-cordova\sample\%~1\www\*.*" "www\"
IF %ERRORLEVEL% == 0 (
	echo Copied 'jxcore-cordova\sample\%~1\www' sample succesfully.
	goto:FINISH
) else (
	echo Could not copy 'jxcore-cordova\sample\%~1\www'
	goto:EXIT_NOW
)

:FINISH
@rem add plugin to the project
call cordova plugin add jxcore-cordova

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
