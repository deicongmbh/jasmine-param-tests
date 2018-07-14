interface String {
    formatUsingObject(instance: object): string;
}

if (!String.prototype.formatUsingObject) {
    String.prototype.formatUsingObject = function(instance) {
        return this.replace(/{(\w+)}/g, function(match) {
            let name = match.replace(/[${}]/g, "");
            return typeof instance[name] != 'undefined'
                ? instance[name]
                : name
                ;
        });
    };
}


