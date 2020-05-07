$(function() {
    let App = {
        debug: false,
        charts: {},
        fields_to_remove: [
            'PRG',
            'ISCRIZIONE',
            'INIZIO ATTIVITA',
            'INDIRIZZO'
        ],
        field_names: {
            inizio_attivita: 'INIZIO ATTIVITA',
            iscrizione: 'ISCRIZIONE',
            attivita: 'PROFESSION',
            settori: 'SUBSECTOR',
            anno: 'YEAR',
            lat: 'LAT',
            lng: 'LNG',
            marker: '_marker',
            provincia: 'PRV',
            row_number: 'rownr',
            fonti: 'DS'
        },
        field_values: {
            settori: {
                nucleo_artistico: 'NUCLEO ARTISTICO',
                settori_complementari: 'SETTORI COMPLEMENTARI',
                industrie_creative: 'INDUSTRIE CREATIVE',
                industrie_culturali: 'INDUSTRIE CULTURALI'
            },
            settori_compact: {
                nucleo_artistico: 'Nu.Ar.',
                settori_complementari: 'Se.Co.',
                industrie_creative: 'I.Cr.',
                industrie_culturali: 'I.Cul.'
            },
            province: {
                BL: 'BL',
                PD: 'PD',
                RO: 'RO',
                TV: 'TV',
                VE: 'VE',
                VR: 'VR'
            },
            attivitaXsettori: {

            },
            attivita: {
                'ALTRO': { icon: 'question' },
                'ARCHITETTURA': { icon: 'landmark' },
                'ARREDAMENTO': { icon: 'chair' },
                'ARTI': { icon: 'palette' },
                'ARTI VISIVE E LETTERATURA': { icon: 'palette' },
                'ATTIVITA RICREATIVE': { icon: 'glass' },
                'BENI CULTURALI': { icon: 'graduation-cap' },

                'BIBLIOTECHE': { icon: 'book' },
                'ICT': { icon: 'laptop' },
                'GAMES': { icon: 'gamepad' },
                'COMUNICAZIONE': { icon: 'bullhorn' },
                'CONSULENZA': { icon: 'briefcase' },
                'DANZA': { icon: 'street-view' },
                'DESIGN': { icon: 'pencil' },
                //'DISTRIBUZIONE': { icon: 'project-diagram' },
                'DISTRIBUZIONE CINEMATOGRAFICA': { icon: 'film' },
                'EDITORIA': { icon: 'book' },
                'FOTOGRAFIA': { icon: 'camera' },
                'GRAFICA': { icon: 'pencil' },
                'INDUSTRIE CULTURALI': { icon: 'user-graduate' },
                'IT': { icon: 'laptop' },
                'LIBRERIE': { icon: 'book' },
                'MODA': { icon: 'tshirt' },
                'MUSEI': { icon: 'university' },
                'MUSEI E GALLERIE': { icon: 'university' },
                'MUSICA': { icon: 'music' },
                'MUSICA/DANZA/ARTI': { icon: 'music' },
                'OREFICERIA': { icon: 'ring' },
                'PRODUZIONE': { icon: 'industry' },
                'CINEMA': { icon: 'film' },
                'PROMOZIONE CULTURALE': { icon: 'funnel-dollar' },
                'RADIO': { icon: 'broadcast-tower' },
                'SALA CINEMATOGRAFICA': { icon: 'film' },
                'RESTAURO': { icon: 'hammer' },
                'SPETTACOLO DAL VIVO': { icon: 'person-booth' },
                'RICERCA': { icon: 'search' },
                'SERVIZI': { icon: 'briefcase' },
                'SERVIZI PER IL PATRIMONIO': { icon: 'dollar-sign' },
                //'STUDI': { icon: 'mail-bulk' },
                'STUDI DI REGISTRAZIONE': { icon: 'microphone-alt' },
                'TEATRO': { icon: 'theater-masks' },
                'TEATRO/ARTI': { icon: 'palette' },
                'TEATRO/DANZA': { icon: 'street-view' },
                'TELEVISIONE': { icon: 'tv' }

            },
            fonti: {
                'CC': 'Source1',
                'DOC': 'Source2',
                'ARTEVEN': 'Another source',
                'BIBLIOTECHE': 'Source3',
                'MUSEI': 'Source4'
            }
        },
        filters: {

        },
        triggers: {

        },
        config: {
            disableClusteringAtZoom: 14,
            clusterPaneZIndex: 620,
            maxClusterRadius: 100,
            sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ3vkQTK-CrT7Rv6Rdu3uDKmumQB94Ic7WrmBu4ezak-72QWbkUISb7FfvR_Z1AhmYgfASVad205BE/pub?output=csv'
        }

    };


    function init() {
        getHashParams();
        initBaseMap();
        loadData();
    }

    function getHashParams() {

        var hashParams = {};
        var e,
            a = /\+/g, // Regex for replacing addition symbol with a space
            r = /([^&;=]+)=?([^&;]*)/g,
            d = function(s) { return decodeURIComponent(s.replace(a, " ")); },
            q = window.location.hash.substring(1);

        while (e = r.exec(q))
            hashParams[d(e[1])] = d(e[2]);

        App.debug = !!hashParams['debug'];
    }

    function log(log) {
        if (App.debug) {
            console.log(log);
        }
    }

    function systemBusy(msg) {
        loadingMsg(msg);
        $('body').addClass('busy');
        $('#loading-msg').show();
    }

    function systemFree() {
        loadingMsg('');
        $('#loading-msg').hide();
        $('body').removeClass('busy');
    }

    function isSystemFree() {
        return !$('body').hasClass('busy');
    }


    function addMapControls() {
        App.mainMap.addLayer(App.clusterMarkers.nucleo_artistico);
        App.mainMap.addLayer(App.clusterMarkers.settori_complementari);
        App.mainMap.addLayer(App.clusterMarkers.industrie_creative);
        App.mainMap.addLayer(App.clusterMarkers.industrie_culturali);
        L.easyPrint({
            title: 'Print',
            position: 'topleft',
            sizeModes: ['A4Portrait', 'A4Landscape']
        }).addTo(App.mainMap);

        L.control.custom({
                position: 'bottomleft',
                content: '<input type="text" id="year-slider" name="my_range" value="" />',
                classes: '',
                id: 'timeline-container',
                style: {
                    cursor: 'pointer',
                    width: '90%',
                    margin: '10px auto 10px',
                    float: 'none'
                }
            })
            .addTo(App.mainMap);

        App.sidebar = L.control.sidebar({
            autopan: false, // whether to maintain the centered map point when opening the sidebar
            closeButton: true, // whether t add a close button to the panes
            container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
            position: 'right', // left or right
        }).addTo(App.mainMap);
        App.sidebar.on('content', function(e) {
            // e.id contains the id of the opened panel
            const removed = $('#sidebar').attr('class').replace(/ dyn-[^ ]+/gi, '');
            $('#sidebar').attr('class', removed);
            $('#sidebar').addClass('dyn-' + e.id);
        })
        App.sidebar.on('closing', function(e) {
            const removed = $('#sidebar').attr('class').replace(/ dyn-[^ ]+/gi, '');
            $('#sidebar').attr('class', removed);
        })

        var clusterPanelContent = {
            id: 'cluster-panel', // UID, used to access the panel
            tab: '<i class="fa fa-layer-group"></i>', // content can be passed as HTML string,
            pane: $('.control-cluster-holder').html(), // DOM elements can be passed, too
            title: 'Sectors Aand Activities', // an optional pane header
            position: 'top' // optional vertical alignment, defaults to 'top'
        };
        App.sidebar.addPanel(clusterPanelContent);

        var provPanelContent = {
            id: 'prov-panel', // UID, used to access the panel
            tab: '<i class="fa fa-city"></i>', // content can be passed as HTML string,
            pane: $('.control-prov-holder').html(), // DOM elements can be passed, too
            title: 'Provinces', // an optional pane header
            position: 'top' // optional vertical alignment, defaults to 'top'
        };
        App.sidebar.addPanel(provPanelContent);

        var fontiPanelContent = {
            id: 'fonti-panel', // UID, used to access the panel
            tab: '<i class="fa fa-database"></i>', // content can be passed as HTML string,
            pane: $('.control-fonti-holder').html(), // DOM elements can be passed, too
            title: 'Sources', // an optional pane header
            position: 'top' // optional vertical alignment, defaults to 'top'
        };
        App.sidebar.addPanel(fontiPanelContent);

        var statsPanelContent = {
            id: 'stats-panel', // UID, used to access the panel
            tab: '<i class="fa fa-info"></i>', // content can be passed as HTML string,
            pane: $('.control-stats-holder').html(), // DOM elements can be passed, too
            title: 'Info', // an optional pane header
            position: 'top' // optional vertical alignment, defaults to 'top'
        };
        App.sidebar.addPanel(statsPanelContent);

        var chartPanelContent = {
            id: 'graph-panel', // UID, used to access the panel
            tab: '<i class="fa fa-chart-pie"></i>', // content can be passed as HTML string,
            pane: '<div id="graph"></div>', // DOM elements can be passed, too
            title: 'Data Structure', // an optional pane header
            position: 'top' // optional vertical alignment, defaults to 'top'
        };
        App.sidebar.addPanel(chartPanelContent);

        startGui();
    }

    function startClusterControl() {

        let templateArgs = {};

        for (const s of Object.keys(App.field_values.settori)) {
            App.filters[s] =
                Bacon.fromEvent($(`#cluster-att-control a[data-cluster="${s}"]`), "click")
                .scan(true, _ => !_)
                .toProperty(true);

            App.filters[s]
                .filter(_ => { return isSystemFree() })
                .onValue(visible => toggleLayer(s, visible));

            templateArgs[s] = App.filters[s];
        }
        App.filters.settori = Bacon.combineTemplate(templateArgs);
        // App.filters.settori.log();

        for (const settore in App.field_values.settori) {
            const settoreName = App.field_values.settori[settore];
            $(`#cluster-att-control .attivita-settore.att-${settore}`).append(`<div class="att-labels"></div>`);
            Object.values(App.field_values.attivitaXsettori[settoreName]).forEach(att => {
                $(`#cluster-att-control .att-${settore} .att-labels`).append(`<a class="badge badge-success" href="#" data-attivita="${att}">${att}</a> `);
            });
        }

    }

    function startYearControl() {
        App.filters.statsReady = new Bacon.Bus();
        App.filters.statsReady.first().onValue(stats => {
            buildIntervalSelector(stats);
            initGraphs();
        })
        App.filters.statsReady.onValue(stats => {
            displayStats(stats);
            updateGraphs();
        })
        App.filters.year_interval = new Bacon.Bus();
    }

    function startProvControl() {
        let templateArgs = {};
        for (let provincia of Object.keys(App.field_values.province)) {
            App.filters[provincia] =
                Bacon.fromEvent($(`.control-prov a[data-prov="${provincia}"]`), "click")
                .scan(true, _ => !_)
                .toProperty(true);
            App.filters[provincia].filter(_ => { return isSystemFree() })
                .onValue(visible => toggleProvincia(provincia, visible));
            templateArgs[provincia] = App.filters[provincia];
        }
        App.filters.province = Bacon
            .combineTemplate(templateArgs);

    }

    function startFontiControl() {
        let templateArgs = {};
        for (let fonte of Object.keys(App.field_values.fonti)) {

            $('#fonti-panel .control-fonti').append(`
            <a class="layer-option active" data-fonte="${fonte}">
            <div class="switch">
                <span></span>
            </div>
            <div class="label">${App.field_values.fonti[fonte]}</div></a>`);
            App.filters[fonte] =
                Bacon.fromEvent($(`.control-fonti a[data-fonte="${fonte}"]`), "click")
                .scan(true, _ => !_)
                .toProperty(true);
            App.filters[fonte].filter(_ => { return isSystemFree() })
                .onValue(visible => toggleFonte(fonte, visible));
            templateArgs[fonte] = App.filters[fonte];
        }
        App.filters.fonti = Bacon
            .combineTemplate(templateArgs);

    }


    function startAttivitaControl() {

        // Object.keys(App.field_values.attivita).forEach(att => {
        //     $('#attivita-selector').append(`<a class="badge badge-success" href="#" data-attivita="${att}">${att}</a> `);
        // });
        let templateArgs = {};
        for (let attivita of Object.keys(App.field_values.attivita)) {
            App.filters[attivita] =
                Bacon.fromEvent($(`#cluster-att-control a[data-attivita="${attivita}"]`), "click")
                .scan(true, _ => !_)
                .toProperty(true);
            App.filters[attivita].filter(_ => { return isSystemFree() })
                .onValue(visible => toggleAttivita(attivita, visible));
            templateArgs[attivita] = App.filters[attivita];
            //App.filters[attivita].log();
        }
        App.filters.attivita = Bacon
            .combineTemplate(templateArgs);

    }

    function startGui() {
        startClusterControl();
        startProvControl();
        startFontiControl();
        startAttivitaControl();
        startYearControl();
        App.filters.all = Bacon.combineTemplate({
                year_interval: App.filters.year_interval.toProperty(null),
                province: App.filters.province.changes().toProperty(null),
                attivita: App.filters.attivita.changes().toProperty(null),
                settori: App.filters.settori.changes().toProperty(null),
                fonti: App.filters.fonti.changes().toProperty(null)
            })
            .throttle(500)
            //.onValue(_ => console.log(_))
            .onValue(_ => updateViz(_));
    }

    function shorten_settore_value(val) {
        let res = '';
        Object.keys(App.field_values.settori).forEach(k => {
            if (App.field_values.settori[k] == val) {
                res = App.field_values.settori_compact[k];
            }
        })
        return res;
    }

    function getSettoriColor(settore) {
        //console.log(settore);
        switch (settore) {
            case App.field_values.settori.nucleo_artistico:
                return '#39a8d9';
            case App.field_values.settori.industrie_creative:
                return '#d2331f';
            case App.field_values.settori.industrie_culturali:
                return '#f69834';
            case App.field_values.settori.settori_complementari:
                return '#74b325';
        }
    }

    function getTreeData() {
        let treeData = [];
        // let q = `SELECT ${App.field_names.provincia}, COUNT(*) AS tot FROM ? GROUP BY ${App.field_names.provincia}`;
        let q = `SELECT DISTINCT ${App.field_names.provincia} AS name FROM ? `;

        var res = alasql(q, [App.currentData]);
        var provTotal = App.currentStats.recordCount;

        res.forEach((provincia, i) => {

            let q2 = `SELECT COUNT(*) AS tot, ${App.field_names.settori} FROM ? WHERE ${App.field_names.provincia} = '${provincia['name']}' GROUP BY ${App.field_names.settori} `;

            var res2 = alasql(q2, [App.currentData]);
            var provData = { name: provincia['name'], children: [] };
            provData['children'] = res2.map(_ => {
                const q3 = `SELECT COUNT(*) AS tot, ${App.field_names.attivita} FROM ? WHERE ${App.field_names.provincia} = '${provincia['name']}' AND ${App.field_names.settori}='${_[App.field_names.settori]}' GROUP BY ${App.field_names.attivita} `;

                const res3 = alasql(q3, [App.currentData]);
                const children = res3.map(_2 => {
                    return { name: _2[App.field_names.attivita], count: _2['tot'], color: tinycolor(getSettoriColor(_[App.field_names.settori])).darken(_2['tot'] * 30 / _['tot']).toString() }
                })
                return { name: _[App.field_names.settori], shortname: shorten_settore_value(_[App.field_names.settori]), count: _['tot'], children: children }
            });
            treeData.push(provData);
        })
        return treeData;
    }

    function updateGraphs() {
        // console.log("update graph");
        App.charts['treemap'].data = getTreeData();
        //chart.dataProvider = NewChartData;

        //Updating the graph to show the new data
        App.charts['treemap'].validateData();
    }

    function initGraphs() {
        am4core.useTheme(am4themes_animated);

        let chart = am4core.create("graph", am4charts.TreeMap);
        chart.maxLevels = 2;
        // define data fields
        chart.dataFields.value = "count";
        chart.dataFields.name = "name";
        chart.dataFields.children = "children";
        chart.dataFields.color = "color";
        chart.homeText = "Breakdown by province";
        chart.navigationBar = new am4charts.NavigationBar();
        var level0SeriesTemplate = chart.seriesTemplates.create("0");
        level0SeriesTemplate.strokeWidth = 2;

        chart.fillOpacity = 0.5;
        var bullet0 = level0SeriesTemplate.bullets.push(new am4charts.LabelBullet());
        level0SeriesTemplate.bulletsContainer.hiddenState.properties.opacity = 0.77;
        level0SeriesTemplate.bulletsContainer.hiddenState.properties.visible = true;
        bullet0.hiddenState.properties.opacity = 1;
        bullet0.locationX = 0.01;
        bullet0.locationY = 0.99;
        bullet0.label.text = "{name}";
        bullet0.label.fill = am4core.color("#ffffff");
        bullet0.background = new am4core.RoundedRectangle();
        bullet0.background.fillOpacity = 0.9;
        bullet0.padding(14, 19, 14, 19);
        bullet0.background.fill = am4core.color("#7678a0");

        var level1SeriesTemplate = chart.seriesTemplates.create("1");
        level1SeriesTemplate.strokeWidth = 2;
        level1SeriesTemplate.fillOpacity = 0.2;
        // level1SeriesTemplate.fillOpacity = 0.5;
        // level1SeriesTemplate.bulletsContainer.hiddenState.properties.opacity = 0.1;
        // level1SeriesTemplate.bulletsContainer.hiddenState.properties.visible = true;
        var bullet1 = level1SeriesTemplate.bullets.push(new am4charts.LabelBullet());
        bullet1.locationX = 0.5;
        bullet1.locationY = 0.5;
        bullet1.label.text = "{shortname}";
        bullet1.label.fill = am4core.color("#ffffff");

        var level2SeriesTemplate = chart.seriesTemplates.create("2");
        var columnTemplate = level2SeriesTemplate.columns.template;
        var image = columnTemplate.createChild(am4core.Image);
        image.opacity = 1;
        image.align = "center";
        image.valign = "middle";
        image.width = 25;
        image.height = 25;
        image.adapter.add("href", function(href, target) {
            var dataItem = target.dataItem;
            if (dataItem) {
                // console.log(dataItem.treeMapDataItem.name);
                return `fa/${App.field_values.attivita[dataItem.treeMapDataItem.name].icon}.png`;
            }
        });
        App.charts['treemap'] = chart;
        App.charts['treemap'].data = getTreeData();
        // var chart = am4core.createFromConfig({
        //     "type": "TreeMap",
        //     "data": res,
        //     "dataFields": {
        //         "value": "value",
        //         "name": 'name',
        //         'children': 'children'
        //     }
        // }, "graph");
    }

    function displayStats(stats) {
        Object.keys(stats).forEach(_ => $(`.stat .${_}.value`).html(stats[_]));
    }



    function buildIntervalSelector(stats) {
        App.initialStats = stats;
        $("#year-slider").ionRangeSlider({
            type: "double",
            min: stats.minYear,
            max: stats.maxYear,
            from: stats.minYear,
            to: stats.maxYear,
            prettify_enabled: false,
            skin: "modern",
            grid: true,
            grid_num: 10,
            onFinish: function(data) {
                App.filters.year_interval.push([data.from, data.to]);
            }
        });
        systemFree();

    }

    function toggleLayer(layer, visible) {
        if (visible) {
            App.mainMap.addLayer(App.clusterMarkers[layer]);
            $(`#cluster-att-control a[data-cluster="${layer}"]`).addClass('active')
        } else {
            App.mainMap.removeLayer(App.clusterMarkers[layer]);
            $(`#cluster-att-control a[data-cluster="${layer}"]`).removeClass('active')
        };
    }

    function toggleProvincia(prov, visible) {
        if (visible) {
            $(`.control-prov a[data-prov="${prov}"]`).addClass('active');
        } else {
            $(`.control-prov a[data-prov="${prov}"]`).removeClass('active');
        };
    }

    function toggleFonte(fonte, visible) {
        if (visible) {
            $(`.control-fonti a[data-fonte="${fonte}"]`).addClass('active');
        } else {
            $(`.control-fonti a[data-fonte="${fonte}"]`).removeClass('active');
        };
    }

    function toggleAttivita(attivita, visible) {
        const selector = `#cluster-att-control a[data-attivita="${attivita}"]`;
        if (visible) {
            $(selector).addClass('badge-success');
        } else {
            $(selector).removeClass('badge-success');
        };
    }

    function initBaseMap() {
        systemBusy('creating map');
        App.mainMap = L.map('main-map', {
            maxBounds: [
                [44.010025, 5.489951],
                [47.288006, 19.718466]
            ],
            minZoom: 7,
            fullscreenControl: true,
        }).setView([45.402312, 11.892034], 8.3);
        App.clusterPanes = {};
        Object.keys(App.field_values.settori).forEach(settore => {
            App.clusterPanes[settore] = App.mainMap.createPane('pane_' + settore);
            App.clusterPanes[settore].style.zIndex = App.config.clusterPaneZIndex;
        });

        addBaseLayers();
    }

    function addBaseLayers() {
        // var baselayer = L.tileLayer('http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
        //     //attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'

        // }).addTo(App.mainMap);
        L.tileLayer.provider('Stamen.Watercolor', { opacity: 0.4 }).addTo(App.mainMap);
        //L.tileLayer.provider('Esri.WorldGrayCanvas', { opacity: 1 }).addTo(App.mainMap);
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            opacity: 0.20,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1Ijoic21hcnF1ZXMiLCJhIjoiY2pyeGg2M2ZlMGxhNjQ0b2E1ajh5OWl5YiJ9.G074wzH9zGbDUonl3rJWrg'
        }).addTo(App.mainMap);

        L.geoJson(venetoData).addTo(App.mainMap);


    }

    function loadingMsg(msg) {
        $('#loading-msg').text(msg);
    }

    function loadData() {
        systemBusy('loading data');
        Papa.parse(App.config.sheetUrl, {
            download: true,
            header: true,
            complete: function(results) {
                if (results.errors.length) {
                    console.log(results.errors);
                    alert('Error processing data');
                }

                processData(results.data);
            }
        })
    }

    function getSignificantYear(el) {
        let res = 0;
        const relevant = (el[App.field_names.inizio_attivita].length) ? el[App.field_names.inizio_attivita] : el[App.field_names.iscrizione];
        if (relevant.length) res = parseInt(relevant.split('/')[2]);
        // console.log(el);
        return res;
    }

    function cleanData(data) {
        loadingMsg('cleaning data');
        return data.map(
            (el, i) => {
                // console.log('Cleaning row ', i);
                // console.log('Cleaning row ', el);

                el[App.field_names.settori] = cleanSettore(el[App.field_names.settori], i);
                if (!App.field_values.attivitaXsettori[el[App.field_names.settori]]) {
                    App.field_values.attivitaXsettori[el[App.field_names.settori]] = [];
                }

                let candAtt = el[App.field_names.attivita]
                    .replace('ATTIVITA\'', 'ATTIVITA')
                    .replace(/^ +/, '')
                    .replace(/ +$/, '')
                    .replace('SPETTACOLO DAL VIVOA', 'SPETTACOLO DAL VIVO')
                    .replace(/ \/ [0-9]+/, '')
                    .replace(/ [AIP]{1,2}$/, '')
                    .replace(/\.[0-9]+$/, '');

                if (candAtt.length == 0) {
                    candAtt = 'ALTRO';
                }
                el[App.field_names.attivita] = candAtt;



                if (App.field_values.attivitaXsettori[el[App.field_names.settori]].indexOf(candAtt) === -1) {
                    App.field_values.attivitaXsettori[el[App.field_names.settori]].push(candAtt);
                }

                //el[App.field_names.anno] = getSignificantYear(el);
                el[App.field_names.row_number] = i + 2;
                App.fields_to_remove.forEach(_ => delete(el[_]));

                return el;
            });
    }

    function getMarkerIcon(row) {
        const att = row[App.field_names.attivita];
        if (App.field_values.attivita[att]) {
            return App.field_values.attivita[att]['icon'];
        }
        log('No icon for ' + row['ATTIVITA']);
        return 'question';

    }

    function getMarkerColor(row) {
        switch (row[App.field_names.settori]) {
            case App.field_values.settori.industrie_creative:
                return 'red';
            case App.field_values.settori.nucleo_artistico:
                return 'blue';
            case App.field_values.settori.settori_complementari:
                return 'green';
            case App.field_values.settori.industrie_culturali:
                return 'orange';
            default:
                console.error('No color for ' + row[App.field_names.settori]);
        }
    }

    function cleanSettore(settore, i) {
        let found = false;
        Object.values(App.field_values.settori).forEach(
            v => {
                // console.log('.*' + v + '.*' + ':' + settore);
                let re = new RegExp('.*' + v + '.*', "g");
                if (settore.match(re)) {
                    found = v;
                }
            }
        );
        if (found) {
            return found;
        }
        console.error('No layer for -' + settore + '-' + i);
        return Object.values(App.field_values.settori)[0];
    }

    function clusterMarker(cluster, extraClass) {
        var childCount = cluster.getChildCount();

        var c = ' ' + extraClass + ' marker-cluster-';
        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 25) {
            c += 'medium';
        } else {
            c += 'large';
        }

        return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
    }

    function floatUpClusterLayer(cluster) {
        Object.keys(App.clusterPanes).forEach(pane => {
            const paneClass = `.leaflet-pane_${pane}-pane`;
            if (pane == cluster) {
                $(`.leaflet-pane_${pane}-pane`).css('z-index', App.config.clusterPaneZIndex + 10);
            } else {
                $(`.leaflet-pane_${pane}-pane`).css('z-index', App.config.clusterPaneZIndex);
            }
        })
    }

    function buildClusterLayers() {
        App.clusterMarkers = {};
        Object.keys(App.field_values.settori).forEach(settore => {
            App.clusterMarkers[settore] = L.markerClusterGroup({
                removeOutsideVisibleBounds: true,
                maxClusterRadius: App.config.maxClusterRadius,
                disableClusteringAtZoom: App.config.disableClusteringAtZoom,
                showCoverageOnHover: false,
                clusterPane: 'pane_' + settore,
                iconCreateFunction: function(cluster) {
                    return clusterMarker(cluster, settore);
                }
            });
            App.clusterMarkers[settore].on('clustermouseover', function(a) {
                floatUpClusterLayer(a.layer.options.pane.substr(5));
            });
        });


    }

    function processData(data) {
        buildClusterLayers();
        log('Received data:');


        App.data = cleanData(data);
        log('Cleaned data:');
        log(data);

        // loadingMsg('adding markers');
        // for (const row of App.data) {
        //     App.clusterMarkers[getClusterLayerName(row)].addLayer(buildMarkerForElement(row));
        // }

        addMapControls();
        //$('body').addClass('loaded');

        //updateCurrentData(App.data);
    }

    function buildMarkerForElement(row) {
        var marker = L.AwesomeMarkers.icon({
            icon: getMarkerIcon(row),
            markerColor: getMarkerColor(row),
            prefix: 'fa'
        });

        return L.marker([row[App.field_names.lat], row[App.field_names.lng]], {
            icon: marker,
            title: App.debug ? '(' + row[App.field_names.row_number] + ') ' + row[App.field_names.attivita] : row[App.field_names.attivita],
            alt: row[App.field_names.attivita],
            riseOnHover: true
        });
    }

    function redraw() {
        var nuclArt = alasql(`SELECT * FROM ? WHERE ${App.field_names.settori} = '${App.field_values.settori.nucleo_artistico}'`, [App.currentData]);
        var setCom = alasql(`SELECT * FROM ? WHERE ${App.field_names.settori} = '${App.field_values.settori.settori_complementari}'`, [App.currentData]);
        var indCr = alasql(`SELECT * FROM ? WHERE ${App.field_names.settori} = '${App.field_values.settori.industrie_creative}'`, [App.currentData]);
        var indCul = alasql(`SELECT * FROM ? WHERE ${App.field_names.settori} = '${App.field_values.settori.industrie_culturali}'`, [App.currentData]);

        App.clusterMarkers.nucleo_artistico.clearLayers().addLayers(nuclArt.map(_ => buildMarkerForElement(_)));
        App.clusterMarkers.settori_complementari.clearLayers().addLayers(setCom.map(_ => buildMarkerForElement(_)));
        App.clusterMarkers.industrie_creative.clearLayers().addLayers(indCr.map(_ => buildMarkerForElement(_)));
        App.clusterMarkers.industrie_culturali.clearLayers().addLayers(indCul.map(_ => buildMarkerForElement(_)));
    }

    function updateCurrentData(data) {
        App.currentData = data;
        updateCurrentStats();
    }

    function updateCurrentStats() {
        App.currentStats = {};
        var res = alasql(`SELECT MIN(${App.field_names.anno}) AS minYear, MAX(${App.field_names.anno}) AS maxYear FROM ? WHERE ${App.field_names.anno} > 1900`, [App.currentData]);
        App.currentStats.minYear = res[0].minYear;
        App.currentStats.maxYear = res[0].maxYear;
        var res = alasql("SELECT COUNT(*) AS tot FROM ? ", [App.currentData]);
        App.currentStats.recordCount = res[0].tot;
        App.filters.statsReady.push(App.currentStats);
        systemFree();
    }

    function updateViz(data) {
        log(data);
        let conds = [];
        if (data.year_interval) {
            conds.push(`( ${App.field_names.anno} >= ${data.year_interval[0]} AND ${App.field_names.anno} <= ${data.year_interval[1]} )`);
        }
        if (data.province) {
            const activeProv = Object.keys(data.province)
                .filter(_ => data.province[_]);

            const condString = activeProv
                .map(_ => `'${App.field_values.province[_]}'`)
                .join(',');
            conds.push(`(${App.field_names.provincia} IN (${condString}))`)

        }

        if (data.attivita) {
            const activeAtt = Object.keys(data.attivita).filter(_ => data.attivita[_]);
            const condString = activeAtt
                .map(_ => `'${_}'`)
                .join(',');
            const conditionAtt = `(${App.field_names.attivita} IN (${condString}))`;
            // console.log(conditionAtt);
            conds.push(conditionAtt);

        }


        if (data.settori) {
            const activeSett = Object.keys(data.settori).filter(_ => data.settori[_]);
            const settoriCondString = activeSett
                .map(_ => `'${App.field_values.settori[_]}'`)
                .join(',');
            //console.log(settoriCondString);
            const conditionSet = `(${App.field_names.settori} IN (${settoriCondString}))`;
            // // console.log(conditionAtt);
            conds.push(conditionSet);

        }

        if (data.fonti) {
            const activeFonti = Object.keys(data.fonti).filter(_ => data.fonti[_]);
            const fontiCondString = activeFonti
                .map(_ => `'${_}'`)
                .join(',');
            // console.log(fontiCondString);
            const conditionFonti = `(${App.field_names.fonti} IN (${fontiCondString}))`;

            conds.push(conditionFonti);

        }

        log(conds);

        let q = 'SELECT * FROM ?';
        if (conds.length) {
            q += ' WHERE ' + conds.join(' AND ');
        }
        log(q);
        var res = alasql(q, [App.data]);
        log(res);
        updateCurrentData(res);
        redraw();
    }

    init();
});
