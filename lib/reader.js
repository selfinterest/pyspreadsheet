/**
 * Created by: Terrence C. Watson
 * Date: 8/8/13
 * Time: 10:38 PM
 */


define(["underscore", "util", "child_process"], function(_, util, child_process){
    var Transform = require("stream").Transform;
    var Buffer = require("buffer");
    util.inherits(ExcelReader, Transform);

    function formatArgs(path, options) {

        var args = ["/home/terrence/Code/node/originaldocuments/csv/pyspreadsheet/python/excel_reader.py"];
        options = options || {};

        if (options.meta) {
            args.push('-m');
        }
        if (options.hasOwnProperty('sheet') && !options.hasOwnProperty('sheets')) {
            options.sheets = options.sheet;
            delete options.sheet;
        }
        if (options.hasOwnProperty('sheets')) {
            if (_.isArray(options.sheets)) {
                args.push(_.map(options.sheets, function (s) { return ['-s', s] }));
            } else {
                args.push(['-s', options.sheets]);
            }
        }
        if (options.hasOwnProperty('maxRows')) {
            args.push(['-r', options.maxRows]);
        }

        args.push(path);
        return _.flatten(args);
    }

    ExcelReader.spawnShell = function(path, pyOptions){
        var self = this;
        self.childProcess = child_process.spawn('python', formatArgs(path, pyOptions));
        self.childProcess.stderr.setEncoding("utf8");
        self.childProcess.stdout.setEncoding("utf8");
        self.childProcess.stderr.on("data", function(data){
            console.log(data);
        });

        return self.childProcess.stdout;
    }

    function ExcelReader(path, options){
        var self = this;

        if (!(this instanceof ExcelReader))
            return new ExcelReader(path, streamOptions, pyOptions);

        Transform.call(this, options);

        this.remaining = "";
        //this.pyshell = new PythonShell(__dirname + '/../python/excel_reader.py', formatArgs(path, options));
    }

    ExcelReader.prototype._transform = function(data, encoding, done){
        //console.log(data.toString());
        data = data.toString();
        var self = this;

        var lines = data.split(/\n/g),
            lastLine = _.last(lines);

        lines[0] = this.remaining + lines[0];
        this.remaining = lastLine;

        _.initial(lines).forEach( function(line){       //iterate over all lines except the last one.
            try {
                //console.log(line);
                //var record = JSON.parse(line), outputArray = [];
                /*if(record.length == 1){
                    outputArray = [record[0]]
                } else if (record.length == 2) {
                    self.push(record.slice(0, 1));
                } else if (record.length > 2) {
                    self.push(record)
                }*/
                //console.log(line);
                self.push(line);
            } catch (err) {
                console.log("Error %s occurred, line is %s", err, line);
            }
        });
        done();
    }

    return ExcelReader;
})