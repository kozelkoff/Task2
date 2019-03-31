const HOST = '127.0.0.1';
const PORT = '3001';

const sendRequest = (method, route, body) => {
    const init = {
        headers: {
            'Content-type': 'application/json',
        },
        method,
        ...(body && { body: JSON.stringify(body) }),
    };

    return fetch(`http://${HOST}:${PORT}${route}`, init);
};

const api = {
    get: route => sendRequest('GET', route, null).then(response => response.json()),
    post: (route, body) => sendRequest('POST', route, body).then(response => response.json()),
    put: (route, body) => sendRequest('PUT', route, body).then(response => response.json()),
    delete: route => sendRequest('DELETE', route, null).then(response => response.json()),
};

(function setButtons() {
    const buttonContainer = document.getElementById('button_container');

    api.get('/tablenames')
        .then(fileNames => {
            fileNames.forEach(fileName => {
                const button = document.createElement('button');
                button.className = "filename-button";
                button.innerHTML = fileName.name;
                button.onclick = function(){
                    document.getElementById("drop_zone").style.display="none";
                    document.getElementById("button_container").style.display="none";
                    api.get(`/table/${fileName.name}`)
                        .then(table =>{
                            const tableContainer = document.getElementById('table_container');
                            console.log(table[0].data);
                            document.getElementsByTagName('body')[0].style.height = "auto";
                            tableContainer.innerHTML = XLSX.utils.sheet_to_html(JSON.parse(table[0].data));
                        });
                };
                buttonContainer.appendChild(button);
            });
        });
})();

const rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer


/*function dropHandler(e) {
    e.stopPropagation(); e.preventDefault();
    const files = e.dataTransfer.files;
    const f = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        if(!rABS) data = new Uint8Array(data);
        const workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const tableData= XLSX.utils.sheet_to_json(worksheet);


        const body = {
            fileName: f.name,
            tableData
        };

        console.log(tableData);
        console.log(JSON.stringify(tableData));

        handleClick(body);


        const files = document.getElementsByClassName("files");


    };
    if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
};*/

function dropHandler(e) {
    e.stopPropagation(); e.preventDefault();
    const files = e.dataTransfer.files;
    const f = files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        if(!rABS) data = new Uint8Array(data);
        const workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const dataJSON = XLSX.utils.sheet_to_json(worksheet);

        const body = {
            fileName: f.name,
            tableDataSheets: worksheet,
            tableDataJSON: dataJSON
        };

        console.log(worksheet);

        handleClick(body);

        const files = document.getElementsByClassName("files");

    };
    if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
};

const dragOverHandler = e => {
    e.preventDefault();
};

const handleClick = (tableJSON) => {


    api.post('/table', tableJSON)
        .then(response => console.log(response));
};




