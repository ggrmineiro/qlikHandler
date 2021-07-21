class qlikHandler {
    visLayout;
    visQtFields;
    visQtRows;
    visDims;
    visMetrics;
    visOrder;
    visFields;
    localStorage;
    qlikObj;
    localStorageItem;
    editRow; //Linha a ser alterada no modal
    editRowId; //id da linha (json) a ser editada
    updatedRow; //table row witch is being updated
    updatedRowData; //Dados já atualizados
    editCells = [6, 7, 8, 9]; //Define wich cells are editable
    meanCell = 10; // average
    medianCell = 11; //recalculated median
    comparisonCell = 5; //another value to create reference price
    considerCell = 12; //lowest value

    constructor(app, table, qlikObj) {
        this.app = app;
        // Define a tabela onde os dados serão colocados (id da div no HTML)
        this.getHtmlTable(table);
        // Pega o id do objeto qlik para trabalhar com ele
        this.getObjectId(qlikObj);

        //Pega visualização e monta tabela
        this.getVisualization().then(() => {
            this.montaTabela(this.qlikObj);
        });
        this.localStorageItem = qlikObj;
        this.getLocal();
    }

    getHtmlTable(htmlId) {
        this.tableHTML = document.getElementById(htmlId);
        this.tableHTML.style.height = "300px";
        this.tableHTML.style.overflowY = "auto";
        this.tableHTML.style.fontSize = "11px";
        // Cria tabela
        let div = document.getElementById("selecionados");
        let table = document.createElement("table");
        // table.id = "table2excel";
        table.id = "tableQlikHandler";
        table.className = "table table-hover table-sm table-responsive";
        let thead = document.createElement("thead");
        let th = document.createElement("tr");
        th.id = "headers";
        thead.append(th);
        table.append(thead);
        let tbody = document.createElement("tbody");
        let tr = document.createElement("tr");
        tbody.append(tr);
        table.append(tbody);
        div.append(table);
        // Cria o elemento hiden que vai guardar os dados
        let hidenData = document.createElement("div");
        hidenData.id = "hidenData";
        hidenData.style.display = "none";
        div.appendChild(hidenData);
        // Cria botões
        let btnInsert = document.createElement("button");
        btnInsert.className = "btn btn-primary";
        btnInsert.id = "handleAddItens";
        btnInsert.innerHTML = 'Adicionar Item <span class="fa fa-plus"></span>';
        btnInsert.style.marginRight = "5px";
        let btnDel = document.createElement("button");
        btnDel.className = "btn btn-primary";
        btnDel.id = "handleClearTable";
        btnDel.innerHTML = 'Limpar Tabela <span class="fa fa-trash"></span>';
        btnDel.style.marginRight = "5px";
        // Botão de exportar para excel
        let btnExport = document.createElement("button");
        btnExport.className = "btn btn-primary";
        btnExport.id = "exportTable";
        btnExport.innerHTML = "Exportar <span class='fa fa-file-excel'></span>";
        //Insere os botões abaixo da tabela
        $(btnInsert).insertAfter(div);
        $(btnDel).insertAfter(btnInsert);
        $(btnExport).insertAfter(btnDel);

        // Cria as ações dos botões
        $("#handleAddItens").click(() => {
            this.getVisualization().then(() => {
                this.handleData(this.objId);
            });
        });
        $("#handleClearTable").click(() => this.clearData(this.objId));
    }

    getObjectId(objId) {
        this.objId = objId;
    }

    // Monta a tabela html (Apenas cabeçalho)
    montaTabela() {
        let table = this.tableHTML.querySelector("table");
        let thead = table.children[0];
        thead = thead.querySelector("tr");

        if (thead.childElementCount > 0) {
            th = thead.querySelectorAll("th");
            th.forEach((elem) => {
                elem.remove();
            });
        }
        // Adiciona o Cabeçalho para #ID
        let thId = document.createElement("th");
        let titleId = "#";
        thId.append(titleId);
        thead.append(thId);

        // Adiciona o título dos campos carregados
        for (i = 0; i <= this.visQtFields - 1; i++) {
            let th = document.createElement("th");
            let title = this.visFields[i].qFallbackTitle;
            th.append(title);
            thead.append(th);
        }
        // Adiciona o Cabeçalho para Editar
        let thEd = document.createElement("th");
        thEd.className = "editCell";
        let titleEd = "Editar";
        thEd.append(titleEd);
        thead.append(thEd);
        // Adiciona o Cabeçalho para Excluir
        let th = document.createElement("th");
        th.className = "noExl";
        let title = "Excluir";
        th.append(title);
        thead.append(th);
        // Adiciona o cabeçalho escondido (updated)
        let thUpd = document.createElement("th");
        thUpd.style.display = "none";
        thead.append(thUpd);

        // Adiciona dados se já existirem
        this.getObjDataToTable();
    }

    // Pega as informações do hypercubo
    getVisualization() {
        return new Promise((resolve, reject) => {
            this.app.visualization.get(this.objId).then((vis) => {
                this.visLayout = vis.model.layout;
                this.visQtFields = this.visLayout.qHyperCube.qSize.qcx;
                this.visQtRows = this.visLayout.qHyperCube.qSize.qcy;
                this.visDims = this.visLayout.qHyperCube.qDimensionInfo;
                this.visMetrics = this.visLayout.qHyperCube.qMeasureInfo;
                this.visOrder = this.visLayout.qHyperCube.qColumnOrder;
                this.visFields = this.visDims.concat(this.visMetrics);
                resolve(this);
                reject(Error);
            });
        });
    }

    // Pega os dados salvos no Local Storage
    getLocal() {
        let rows = JSON.parse(localStorage.getItem(this.localStorageItem));
        this.localStorage = rows;
    }

    // Pega os dados do hypercubo
    getObjData() {
        console.log("Getting object data..");

        // Atualiza o Local Storage com os dados do local storage antigo e com as novas linhas da tabela
        this.app.getObject(this.objId).then((model) => {
            model
                .getHyperCubeData("/qHyperCubeDef", [{
                    qTop: 0,
                    qLeft: 0,
                    qWidth: this.visQtFields,
                    qHeight: this.visQtRows,
                }, ])
                .then((data) => {
                    let rows = data[0].qMatrix;

                    rows.forEach((hyperCubeData) => {
                        let updated = { qText: 0 };
                        hyperCubeData.push(updated);
                    });
                    var savedItens = this.localStorage;
                    if (savedItens) {
                        // Junta cada um dos que já estavam salvos ao resultado da seleção
                        savedItens.forEach((item) => {
                            rows.push(item);
                        });
                    }
                    let jsonData = JSON.stringify(rows);

                    this.localStorage = rows;
                });
        });

        // return new Promise((resolve, reject) => {
        //     resolve("Data Fetched and Local Storage Updated");
        //     reject(Error);
        // });
    }

    // Pega o json do this.localStorage e coloca na tabela HTML
    getObjDataToTable() {
        let tableExists = this.tableHTML.querySelector("table");
        let tbody = tableExists.children[1];
        if (tbody) {
            if (tbody.childElementCount > 0) {
                let tr = tbody.querySelectorAll("tr");
                tr.forEach((elem) => {
                    elem.remove();
                });
            }
        }

        let localItens = this.localStorage;
        // console.log(localItens);
        if (localItens != null) {
            let rows = localItens;
            let qtRows = rows.length;

            if (qtRows > 0) {
                // Pega o corpo ta tabela para inserir as linhas selecionadas
                let table = this.tableHTML.querySelector("table tbody");
                for (var j = 0; j <= qtRows - 1; j++) {
                    // console.log(`Row ${j}:`);
                    let row = table.insertRow(-1);
                    row.id = "row_" + j;

                    // Coloca os dados na tabela HTML
                    let i = 0;
                    for (var k = 0; k < rows[j].length - 1; k++) {
                        let item = rows[j][k];
                        // console.log(item);
                        let cell = row.insertCell(i);
                        cell.innerHTML = item.qText;
                        i++;
                    }
                    // rows[j].forEach((item) => {});
                    // Adiciona o id da linha
                    let cellId = row.insertCell(0);
                    cellId.innerHTML = j;
                    // Editar
                    let cellEd = row.insertCell(-1);
                    // Updated Cell
                    let updated = rows[j].slice(-1);
                    updated = updated[0].qText;
                    let classValue = updated > 0 ? "updatedCell" : "";
                    cellEd.innerHTML = '<button class="btn btn-light editCell ' + classValue + '"><span><i class="fas fa-edit"></i></span></button>';
                    // Excluir
                    let cell = row.insertCell(-1);
                    cell.innerHTML = '<button class="btn btn-warning removeRowBtn"><span><i class="fas fa-trash"></i></span></button>';
                    // Td Updated
                    // let cellUpd = row.insertCell(-1);
                    // let input = document.createElement("input");
                    // input.type = "hidden";
                    // input.value = updated;
                    // cellUpd.innerHTML = input;
                }

                $(".editCell").click((elem) => {
                    let tdElem = elem.currentTarget.parentNode;
                    let row = tdElem.parentNode.firstChild.innerHTML;
                    let updatedRow = tdElem.parentNode;
                    this.updatedRow = updatedRow;

                    // Salvar a linha atual
                    this.editRow = this.localStorage[row];
                    this.editRowId = row;
                    // Cria e abre em um modal a linha carregada com possibilidade de editar
                    this.createModalEditCell();
                });

                $(".removeRowBtn").click((elem) => {
                    this.removeRow(elem);
                });
                // Atualiza o Local Storage
                this.updateLocalStorage();
            }
        }
    }

    clearData() {
        let table = this.tableHTML.querySelector("table tbody");
        // console.log(table);
        let rows = table.children;
        rows = Array.from(rows);
        if (rows) {
            // Remove todas as linhas da tabela
            rows.map((tr) => {
                tr.remove();
            });
            // Limpa o localStorage
            this.localStorage = null;
            localStorage.removeItem(this.localStorageItem);
        }
    }

    removeRow(elem) {
        let deleteItem = elem.currentTarget;
        let arrayIndex = deleteItem.parentNode.parentNode.children[0].innerHTML;

        let stored = this.localStorage;
        // Remove os dados guardados
        stored.splice(arrayIndex, 1);
        let data = JSON.stringify(stored);
        // Remove a linha selecionada
        deleteItem.parentNode.parentNode.remove();
        // Atualiza o localStorage
        setTimeout(() => {
            this.updateLocalStorage(data);
        }, 1000);
        // Atualiza tabela
        this.getObjDataToTable();
    }

    updateLocalStorage() {
        localStorage.removeItem(this.localStorageItem);
        let data = JSON.stringify(this.localStorage);
        localStorage.setItem(this.localStorageItem, data);
    }

    handleData() {
        let qtFields = this.visQtFields;
        let qtRows = this.visQtRows;
        // Informa o usu´ário que está mexendo nos dados
        let btnInsert = $("#handleAddItens");
        btnInsert[0].disabled = true;
        btnInsert[0].innerHTML = "Adicionando....";

        // valida limite de dados do Hypercubo
        if (qtFields * qtRows >= 10000) {
            alert("Escolha menos linhas pra adicionar à tabela");
            return;
        }
        console.log("handling data...");
        // new Promise((resolve, reject) => {
        this.getObjData();
        setTimeout(() => {
            this.getObjDataToTable();
            btnInsert[0].innerHTML = 'Adicionar Item <span class="fa fa-plus"></span>';
            btnInsert[0].disabled = false;
        }, 1000);
    }

    createModalEditCell() {
        $("#modalEdit").remove();
        let modal = document.createElement("div");
        modal.id = "modalEdit";
        modal.className = "modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("tabindex", -1);
        let modalDialog = document.createElement("div");
        modalDialog.setAttribute("role", "document");
        modalDialog.className = "modal-dialog";
        modal.append(modalDialog);
        let modalContent = document.createElement("div");
        modalContent.className = "modal-content";
        modalDialog.append(modalContent);
        let modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";
        modalContent.append(modalHeader);
        let modalTitle = document.createElement("h5");
        modalTitle.className = "modal-title";
        modalTitle.innerHTML = "Editar #" + this.editRowId;
        modalHeader.append(modalTitle);
        let btnClose = document.createElement("button");
        btnClose.className = "close";
        btnClose.setAttribute("data-dismiss", "modal");
        btnClose.setAttribute("aria-label", "Close");
        btnClose.addEventListener("click", () => {
            $("#modalEdit").toggle();
        });
        modalHeader.append(btnClose);
        let spanClose = document.createElement("span");
        spanClose.setAttribute("aria-hidden", "true");
        spanClose.innerHTML = "&times";
        btnClose.append(spanClose);
        let modalBody = document.createElement("div");
        modalBody.className = "modal-body";
        modalContent.append(modalBody);
        let divEdit = document.createElement("div");
        divEdit.id = "divEdit";
        modalBody.append(divEdit);
        let modalFooter = document.createElement("div");
        modalFooter.className = "modal-footer";
        modalContent.append(modalFooter);
        let btnSave = document.createElement("button");
        btnSave.className = "btn btn-primary";
        btnSave.innerHTML = "Salvar";
        btnSave.id = "btnSaveEdit";
        btnSave.disabled = true;
        modalFooter.append(btnSave);
        let btnCloseModal = document.createElement("button");
        btnCloseModal.className = "btn btn-secondary";
        btnCloseModal.innerHTML = "Fechar";
        btnCloseModal.setAttribute("data-dismiss", "modal");
        btnCloseModal.addEventListener("click", () => {
            $("#modalEdit").toggle();
        });
        modalFooter.append(btnCloseModal);
        $("body").append(modal);

        this.createEditTable();
        this.editTable();
    }

    createEditTable() {
        // Monta a tabela html (Apenas cabeçalho) para a tabela que terá os valores editados
        let divEdit = $("#divEdit")[0];
        // Adiciona o título e valores dos campos carregados
        for (i = 0; i <= this.visQtFields; i++) {
            if (i === this.visQtFields) {
                let row = document.createElement("div");
                row.className = "row";
                let input = document.createElement("input");
                input.type = "hidden";
                input.id = "hidden_updated";
                row.append(input);
                divEdit.append(row);
            } else {
                let row = document.createElement("div");
                row.className = "row";
                let col1 = document.createElement("div");
                col1.className = "col-md-6";
                let col2 = document.createElement("div");
                col2.className = "col-md-6";
                row.append(col1);
                row.append(col2);
                let input = document.createElement("input");
                input.id = `input${i}`;
                input.type = "text";
                input.className = "form-control";
                input.style.width = "100%";
                input.style.margin = "3px 0";
                input.style.paddingLeft = "5px";
                let value = this.editRow[i].qText;
                input.value = value;
                let lable = document.createElement("label");
                let title = this.visFields[i].qFallbackTitle;
                lable.htmlFor = i;
                lable.innerHTML = title;
                input.setAttribute("disabled", "false");
                i === this.meanCell ? (input.id = "meanCell") : null;
                i === this.medianCell ? (input.id = "medianCell") : null;
                i === this.considerCell ? (input.id = "considerCell") : null;
                this.editCells.map((cell) => {
                    if (cell === i) {
                        input.className = "updateCell form-control";
                        input.removeAttribute("disabled");
                    }
                });
                col1.append(lable);
                col2.append(input);
                divEdit.append(row);
            }
        }
    }

    editTable() {
        $("#btnSaveEdit").click(() => {
            $("#hidden_updated")[0].value = 1;

            //    Get updated values
            let editValues = $("#divEdit")[0].querySelectorAll("input");
            // let updatedCell =
            var obj = [];
            editValues.forEach((elem) => {
                let newRowValue = {};
                newRowValue["qText"] = elem.value;
                obj.push(newRowValue);
            });
            console.log(obj);
            this.updatedRowData = obj;
            $("#modalEdit").toggle();

            // Save updated values in this.localStorage
            this.localStorage[this.editRowId] = this.updatedRowData;
            // flash updated row
            let updatedRow = this.updatedRow;
            updatedRow.className = "updated";

            // Marca a linha como updated
            let btn = $(`#row_${this.editRowId}`)[0].querySelector(".editCell");
            console.log(btn);
            btn.className += " updatedCell";

            // Recreate the table and update local Storage item
            setTimeout(() => {
                this.getObjDataToTable();
            }, 1000);
        });

        $(".updateCell").change((cell) => {
            $("#btnSaveEdit")[0].disabled = false;
            let changeCell = cell.currentTarget;
            let updatedRow = changeCell.parentNode;
            console.log(updatedRow);
            let updatedCellId = changeCell.id;
            let cellValue = $(`#${updatedCellId}`)[0].value;
            cellValue = cellValue.replace(".", "");
            cellValue = cellValue.replace(",", ".");
            let medianArray = [];

            if (isNaN(cellValue)) {
                changeCell.style.borderColor = "red";
            } else {
                changeCell.style.borderColor = "orange";
            }

            var updatedValue = 0;
            let size = this.editCells.length;

            // Recalcula a média e mediana automaticamente a cada update dos campos
            // Média
            this.editCells.forEach((cell) => {
                let value = $(`#input${cell}`)[0].value;
                value = value.replace(".", "");
                value = value.replace(",", ".");
                // Se campo for nulo ou string desconsidera para os cálculos
                if (isNaN(value) || value.length == 0) {
                    size--;
                } else {
                    medianArray.push(parseFloat(value));
                    updatedValue += parseFloat(value);
                }
            });
            let newMean = updatedValue / size;
            $("#meanCell")[0].value = newMean.toFixed(2).toString().replace(".", ",");

            // Mediana
            if (medianArray.length === 0) return 0;
            medianArray.sort(function(a, b) {
                return a - b;
            });
            var half = Math.floor(medianArray.length / 2);
            if (medianArray.length % 2) {
                var newMedian = medianArray[half]; // array ímpar
            } else {
                var newMedian = (medianArray[half - 1] + medianArray[half]) / 2.0; // array par
            }
            $("#medianCell")[0].value = newMedian.toFixed(2).toString().replace(".", ",");

            // Select the best (smallest) value
            let conj = $(".updateCell");
            conj.push($("#medianCell")[0]);
            conj.push($("#meanCell")[0]);
            conj.push($(`#input${this.comparisonCell}`)[0]);

            for (i = 0; i < conj.length; i++) {
                var valueLoop = conj[i].value;
                valueLoop = valueLoop.replace(".", "");
                valueLoop = valueLoop.replace(",", ".");
                valueLoop = parseFloat(valueLoop);

                if (i === 0) {
                    var minVal = valueLoop;
                    var minValId = conj[i].id;
                } else {
                    // console.log(`Comparando ${valueLoop} com ${minVal}`);
                    minVal = valueLoop < minVal ? valueLoop : minVal;
                    minValId = valueLoop < minVal ? conj[i].id : minValId;
                    // console.log(`O Menor é ${minVal} de ${minValId}`);
                }
            }
            $(`#considerCell`)[0].value = minVal;
        });

        $("#modalEdit").toggle();
    }
}