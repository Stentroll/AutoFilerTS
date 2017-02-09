var JsonReader = (function () {
    function JsonReader(ta) {
        var _this = this;
        this.inputlist = document.createElement('input');
        this.callbackFunction = function () {
            for (var siteref in _this.sitelist) {
                var option = document.createElement('option');
                option.value = _this.sitelist[siteref]['name'];
                _this.datalist.appendChild(option);
            }
        };
        this.textarea = ta;
        this.mainDiv = document.createElement('div');
        this.mainDiv.id = "jsonreaderDiv";
        this.mainDiv.style.paddingBottom = "10px";
        this.form = document.createElement('form');
        this.form.method = "get";
        this.form.style.display = "inline";
        this.form.style.padding = "10px";
        this.form.style.paddingLeft = "0px";
        this.form.onsubmit = function () { return _this.PopulateConfigTextbox(); };
        this.datalist = document.createElement('datalist');
        this.datalist.id = "datalist";
        this.inputlist.type = 'sitelist';
        this.inputlist.name = 'sitelist';
        this.inputlist.style.width = '300px';
        this.inputlist.setAttribute('list', 'datalist');
        this.inputlist.placeholder = 'Type site name here...';
        this.inputlist.onchange = function () { return _this.PopulateConfigTextbox(); };
        this.form.appendChild(this.inputlist);
        this.form.appendChild(this.datalist);
        this.mainDiv.appendChild(this.form);
    }
    JsonReader.prototype.PopulateConfigTextbox = function () {
        for (var siteref in this.sitelist) {
            if (this.sitelist[siteref]['name'] == this.inputlist.value) {
                this.selectedSite = this.sitelist[siteref];
                this.textarea.textContent = this.sitelist[siteref]['config'];
                ParseAFConfig();
                return false;
            }
        }
        alert("Invalid site name entered");
        return false;
    };
    JsonReader.prototype.ReadFromFile = function (callbackFunction) {
        var _this = this;
        var file = "http://displaypc:8080/viktortools/jsondata.txt";
        var rawFile = new XMLHttpRequest();
        rawFile.onerror = this.XMLHttpRequestFailed;
        rawFile.open("GET", file);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    try {
                        _this.sitelist = JSON.parse(rawFile.responseText);
                    }
                    catch (err) {
                        _this.inputlist.disabled = true;
                        _this.inputlist.placeholder = "Could not load autofiler configurations";
                    }
                    callbackFunction();
                }
            }
        };
        rawFile.send();
    };
    JsonReader.prototype.XMLHttpRequestFailed = function () {
    };
    JsonReader.prototype.Build = function () {
        this.ReadFromFile(this.callbackFunction);
        return this.mainDiv;
    };
    return JsonReader;
}());
