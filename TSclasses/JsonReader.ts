class JsonReader {
    mainDiv: HTMLDivElement;
    datalist: HTMLDataListElement;
    form: HTMLFormElement;
    inputlist: HTMLInputElement = document.createElement('input');
    sitelist: Object[];
    selectedSite: Object;
    textarea: HTMLTextAreaElement;

    constructor(ta: HTMLTextAreaElement) {
        this.textarea = ta;
        this.mainDiv = document.createElement('div');
        this.mainDiv.id = "jsonreaderDiv";
        this.mainDiv.style.paddingBottom = "10px";

        this.form = document.createElement('form');
        this.form.method = "get";
        this.form.style.display = "inline";
        this.form.style.padding = "10px";
        this.form.style.paddingLeft = "0px";
        this.form.onsubmit = () => this.PopulateConfigTextbox();

        this.datalist = document.createElement('datalist');
        this.datalist.id = "datalist";

        //this.inputlist = document.createElement('input');
        this.inputlist.type = 'sitelist';
        this.inputlist.name = 'sitelist';
        this.inputlist.style.width = '300px';
        this.inputlist.setAttribute('list', 'datalist');
        this.inputlist.placeholder = 'Type site name here...';
        this.inputlist.onchange = () => this.PopulateConfigTextbox();

        this.form.appendChild(this.inputlist);
        this.form.appendChild(this.datalist);

        this.mainDiv.appendChild(this.form);
    }

    PopulateConfigTextbox() {

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

    }

    ReadFromFile(callbackFunction) {
        
        var file = "http://displaypc:8080/viktortools/jsondata.txt";
        var rawFile = new XMLHttpRequest();

        rawFile.onerror = this.XMLHttpRequestFailed;
        
        rawFile.open("GET", file);
        rawFile.onreadystatechange = () => {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    try {
                        this.sitelist = JSON.parse(rawFile.responseText);
                    }
                    catch (err){
                        this.inputlist.disabled = true;
                        this.inputlist.placeholder = "Could not load autofiler configurations";

                    }
                    callbackFunction();
                }
            }
        }
        rawFile.send();
    }

    XMLHttpRequestFailed() {
    }

    public callbackFunction = () => {
        for (var siteref in this.sitelist) {
            var option = document.createElement('option');
            option.value = this.sitelist[siteref]['name'];
            this.datalist.appendChild(option);
        }
    }

    Build(): HTMLDivElement {
        this.ReadFromFile(this.callbackFunction);
        return this.mainDiv;
    }
}