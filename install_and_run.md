
# Description

The `install_and_run.sh` script automates the following tasks on **posix** platforms:

1. creating cordova project
2. downloading JXcore-cordova plugin
3. adding it to the project
4. optionally applies chosen sample application from `sample` folder

The script assumes, that cordova is already installed as well as android sdk and iOS tools.

> There is also `install_and_run.bat` version for Windows systems.

# Usage

### Download the script

Download `install_and_run.sh` and save into an empty folder.

### Run the script

The following command runs the jxcore-cordova app with original sample.

```bash
$ ./install_and_run.sh
```

### Run the script with other sample

If you want to launch any of the prepared samples (from the `sample` folder), you may add it's folder name like this:

```bash
$ ./install_and_run.sh "express sample"
```

or

```bash
$ ./install_and_run.sh "express performance sample"
```

# Platforms

By default the script runs the app on android platform, however you can uncomment the last two lines to run it also for iOS:

```bash
# or run on ios
#cordova platforms add ios
#cordova run ios
```

# Tips

If you don't want to clone the jxcore-cordova repository each time you run the `install_and_run.sh` script, you may download it manually once, e.g.:

```bash
$ mkdir myrepo
$ cd myrepo
$ git clone https://github.com/jxcore/jxcore-cordova
```

and replace `git clone` command inside `install_and_run.sh` with:

```bash
cp -rf ~/path/to/myrepo/jxcore-cordova ./
```

This will just copy the jxcore-cordova folder instead of cloning it.