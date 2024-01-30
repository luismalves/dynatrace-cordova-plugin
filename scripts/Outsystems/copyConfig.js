module.exports = function (context) {
    var deferral;
    var fs;
    var path;
    function isCordovaAbove (context, version) {
        var cordovaVersion = context.opts.cordova.version;
        console.log(cordovaVersion);
        var sp = cordovaVersion.split('.');
        return parseInt(sp[0]) >= version;
      }
    if(isCordovaAbove(context,8)){
        deferral = require("q").defer();
        fs  = require("fs");
        path  = require("path");
    }else{
        deferral = context.requireCordovaModule("q").defer();
        fs  = context.requireCordovaModule("fs");
        path  = context.requireCordovaModule("path");
    }

    // Get the command-line arguments passed to the plugin
    const args = process.argv;

    // Find the CONFIG_FILE_SUFFIX parameter from the arguments
    var suffix = null;
    for (const arg of args) { 
        if (arg.includes('CONFIG_FILE_SUFFIX')){
            var stringArray = arg.split("=");
            suffix = stringArray.slice(-1).pop();
        }
    }

    var wwwPath = path.join(context.opts.projectRoot,"www");
    var configPath = path.join(wwwPath, "dynatraceConfig");

    // If the CONFIG_FILE_SUFFIX parameter is found, download the file
    if (suffix) {
        configPath = path.join(configPath, suffix);
        console.log('configPath is: ' + configPath)
    }

    files = fs.readdirSync(configPath);
    if(files.length >0){
        copyFolderRecursiveSync(configPath, path.join(context.opts.projectRoot));
        deferral.resolve();
    }else{
        console.log("Failed to handle plugin resources: " + configPath);
        deferral.resolve();
    }

    function copyFileSync(source, target){

        var targetFile = target; 

        if(fs.existsSync(target)){
            if(fs.lstatSync(target).isDirectory()){
                targetFile = path.join(target,path.basename(source));
            }
        }

        fs.writeFileSync(targetFile,fs.readFileSync(source));
    }

    function copyFolderRecursiveSync(source, target){
        var files = [];

        var targetFolder = path.join(target);
        if(!fs.existsSync(targetFolder)){
            fs.mkdirSync(targetFolder);
        }

        if(fs.lstatSync(source).isDirectory()){
            files = fs.readdirSync(source);
            files.forEach((file)=>{
                var curSource = path.join(source,file);
                if(fs.lstatSync(curSource).isDirectory()){
                    copyFolderRecursiveSync(curSource,targetFolder);
                }else{
                    copyFileSync(curSource,targetFolder);
                }
            });
        }
    }
    return deferral.promise;
};