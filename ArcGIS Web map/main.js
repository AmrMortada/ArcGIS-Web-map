// Get map element
const viewDiv = document.querySelector("#viewDiv");

const [
  Map,
  MapView,
  MapImageLayer,
  FeatureLayer,
  Query,
  Graphic,
  GraphicsLayer,
  identifyModule,
  IdentifyParameters,
  PopupTemplate,
] = await $arcgis.import([
  "@arcgis/core/Map.js",
  "@arcgis/core/views/MapView.js",
  "@arcgis/core/layers/MapImageLayer.js",
  "@arcgis/core/layers/FeatureLayer.js",
  "@arcgis/core/rest/support/Query.js",
  "@arcgis/core/Graphic.js",
  "@arcgis/core/layers/GraphicsLayer.js",
  "@arcgis/core/rest/identify.js",
  "@arcgis/core/rest/support/IdentifyParameters.js",
  "@arcgis/core/PopupTemplate.js",
]);

// Map image layer
const url =
  "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/";
const title = "USA";

const layer = new MapImageLayer({
  url: url,
  title: title,
  sublayers: [
    {
      id: 2,
      title: "States",
      visible: false,
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [255, 255, 255, 0.2],
          outline: {
            color: "#a92d18",
            width: 1,
          },
        },
      },
      queryConfig: {
        fields: [
          { name: "state_name", label: "State Name", type: "text" },
          {
            name: "sub_region",
            label: "US Sub Region",
            type: "domain",
            options: [
              { value: "New Eng", label: "New England" },
              { value: "Mid Atl", label: "Mid Atlantic" },
              { value: "S Atl", label: "South Atlantic" },
              { value: "E N Cen", label: "East North Central" },
              { value: "Mountain", label: "Mountain" },
              { value: "Pacific", label: "Pacific" },
            ],
          },
        ],
        displayField: "state_name",
      },
      identifyFields: ["state_name", "state_abbr", "sub_region", "pop2000"],
    },
    {
      id: 0,
      title: "Cities",
      visible: false,
      queryConfig: {
        fields: [
          {
            name: "pop2000",
            label: "Minimum Population (Year 2000)",
            type: "number",
          },
        ],
        displayField: "areaname",
      },

      identifyFields: ["areaname", "pop2000"],
    },
  ],
});

// Create Map
const myMap = new Map({
  basemap: "dark-gray-vector",
  layers: [layer],
});

// Create View
const view = new MapView({
  container: "viewDiv",
  map: myMap,
  center: [-113.47973811, 46.7753919],
  zoom: 2,
  constraints: {
    minZoom: 2,
    maxZoom: 10,
  },
});

/////////////////////////////////////// widget /////////////////////////////////////////
// BasemapGallery widget

const gallery = document.createElement("arcgis-basemap-gallery");
gallery.view = view;

const expand = document.createElement("arcgis-expand");
expand.view = view;
expand.appendChild(gallery);

view.ui.add(expand, "top-right");

// Home widget
const home = document.createElement("arcgis-home");
home.view = view;

view.ui.add(home, "top-left");

// Locate widget
const locate = document.createElement("arcgis-locate");
locate.view = view;

view.ui.add(locate, "bottom-left");

view.map.add(layer);

///////////////////////////////////////////////////////////////////////////////
await layer.loadAll();
layer.sublayers?.forEach((sublayer) => {
  const listItem = document.querySelector(
    `calcite-list-item[value="${sublayer.id}"]`,
  );
  if (listItem) {
    listItem.selected = sublayer.visible;
  }
});

let nav_btns = document.querySelectorAll(".nav_btn");
let sidebar_pages = document.querySelector(".app_sidebar");

// Change sidebar page on click of nav buttons
nav_btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    nav_btns.forEach((btn) => btn.classList.remove("active"));
    btn.classList.add("active");
    if (btn.innerText === "Layers") {
      sidebar_pages.children[0].style.display = "block";
      sidebar_pages.children[1].style.display = "none";
    } else {
      sidebar_pages.children[0].style.display = "none";
      sidebar_pages.children[1].style.display = "block";
    }
  });
});

let identifyChecked = false;
let identifyNm;
let checkBox = document.querySelectorAll(".checkLy");
checkBox.forEach((box, indx) => {
  box.addEventListener("change", () => {
    identifyChecked = box.checked;
    if (identifyChecked) {
      identifyNm = box.name;
    }

    turnLyerOnOff(box.name, box.checked);
  });
});

// Dropdown layers
let dropDown = document.querySelector("#layerSelect");
let finalQuery;
let querBtnActive;
let layerID;
let layerNm;
let layerFields;
let mainAttribute;
dropDown.addEventListener("change", () => {
  finalQuery = [];
  querBtnActive = false;
  //Cath layer form element
  let sublyrs = layer.sublayers;

  let layerForm = document.querySelector("#layerForm");

  //Check if there are any chosen layer to remove first and add them
  let isListCreated = document.querySelectorAll(".formGroup");
  if (isListCreated.length > 0) {
    isListCreated.forEach((htmlElem) => {
      htmlElem.remove();
    });

    // Search for layer that fields will be added
    sublyrs.forEach((sublayer) => {
      if (dropDown.value === sublayer.title) {
        layerFields = sublayer.identifyFields;
        layerID = sublayer.id;
        layerNm = sublayer.title;

        layerFields.forEach((fields) => {
          //Create input and lable for add field
          let lableLT = document.createElement("label");
          lableLT.className = "myLable";
          lableLT.textContent = fields;

          let inputList = document.createElement("input");
          inputList.placeholder = fields;
          inputList.name = fields;
          inputList.className = "formSty";
          inputList.classList.add("inptField");

          //add fields of layers
          let myDivField = document.createElement("div");
          myDivField.className = "formGroup";

          myDivField.appendChild(lableLT);
          myDivField.appendChild(inputList);
          layerForm.appendChild(myDivField);
        });
      }
    });
    //Add field directly without remove and thing
  } else {
    // Search for layer that fields will be added
    sublyrs.forEach((sublayer) => {
      if (dropDown.value === sublayer.title) {
        layerFields = sublayer.identifyFields;
        layerID = sublayer.id;
        layerNm = sublayer.title;

        layerFields.forEach((fields) => {
          //Create input and lable for add field
          let lableLT = document.createElement("label");
          lableLT.className = "myLable";
          lableLT.textContent = fields;

          let inputList = document.createElement("input");
          inputList.placeholder = fields;
          inputList.name = fields;
          inputList.className = "formSty";
          inputList.classList.add("inptField");

          //add fields of layers
          let myDivField = document.createElement("div");
          myDivField.className = "formGroup";

          myDivField.appendChild(lableLT);
          myDivField.appendChild(inputList);
          layerForm.appendChild(myDivField);
        });
      }
    });
  }
  let inptuss = document.querySelectorAll(".inptField");
  inptuss.forEach((inpt) => {
    inpt.addEventListener("input", () => {
      if (inpt.value.trim().length > 0) {
        querBtnActive = false;
      }
    });
  });
});

// Zoom to layer in layer containers
let zoomLayerBtn = document.querySelectorAll(".zoomLyBtn");
zoomLayerBtn.forEach((zmLy) => {
  zmLy.addEventListener("click", () => {
    zoomToLayer(zmLy.name);
  });
});

//##########################-->>>>>>>>>>

//Clear field value
clearInputField();

//Send query result
queryResult();

// identify tool
identifyTool();

////////////////////////////////////// functions //////////////////////////////////////////////

// function to turn ON/OFF layers in layer page
function turnLyerOnOff(layerName, isChecked) {
  layer.sublayers.forEach((sublayer) => {
    if (sublayer.title === layerName) {
      sublayer.visible = isChecked;
    }
  });
}

// function to zoom to each layer in layer page
function zoomToLayer(layerName) {
  let targetLayer;
  layer.sublayers.forEach((sublayer) => {
    if (sublayer.title === layerName) {
      targetLayer = layer.findSublayerById(sublayer.id);

      view.goTo(targetLayer.fullExtent);
    }
  });
}

// function to clear add input in layer field
function clearInputField() {
  let clearBtn = document.querySelector(".clear");

  clearBtn.addEventListener("click", () => {
    const allInputField = document.querySelectorAll(".inptField");
    allInputField.forEach((inputField) => {
      inputField.value = "";
    });
    recordsClear();
    finalQuery = [];
    querBtnActive = false;
  });
}

// function to send query result
function queryResult() {
  let queryBtn = document.querySelector(".submit");

  queryBtn.addEventListener("click", async () => {
    const queryResult = document.querySelectorAll(".inptField");
    finalQuery = [];
    if (querBtnActive === false) {
      recordsClear();
      queryResult.forEach((queryRes) => {
        if (queryRes.value.trim().length > 0 && queryRes.value.trim() !== "") {
          if (queryRes.name === "pop2000") {
            finalQuery.push(`${queryRes.name} >= '${queryRes.value.trim()}'`);
          } else {
            finalQuery.push(`${queryRes.name} = '${queryRes.value.trim()}'`);
          }
        }
      });
      if (finalQuery.length > 0) {
        recordsFeaures(layerID);
        zoomAllRec(layerID);
        querBtnActive = true;
      }
    }
  });
}

// function to add records result
async function recordsFeaures(lyID) {
  layerNM();

  //Query
  const sublayer = layer.findSublayerById(lyID);

  const results = await sublayer.queryFeatures({
    where: finalQuery.join(" AND "),
    returnGeometry: true,
    outFields: [layerFields],
  });
  let querResult = results.features;

  // records container Div
  let recordsContainer = document.createElement("div");
  recordsContainer.id = "recordsCont";

  querResult.forEach((result) => {
    let resultDiv = document.querySelector("#actionBtns");

    // feature record creation
    let recordCards = document.createElement("div");
    recordCards.textContent = result.attributes[mainAttribute];
    recordCards.className = "formSty";
    recordCards.classList.add("recordCard");

    // record highlight btn
    let recordHighlightBtn = document.createElement("button");
    let recordHighlightIcon = document.createElement("i");
    recordHighlightBtn.className = "highlightRecBtn";
    recordHighlightIcon.className = "fa-solid fa-star";
    recordHighlightBtn.name = result.attributes[mainAttribute];
    recordHighlightBtn.title = "Highlight feature";

    // record zoom btn
    let recordZoomBtn = document.createElement("button");
    let recordZoomIcon = document.createElement("i");
    recordZoomBtn.className = "zoomRecBtn";
    recordZoomIcon.className = "fa-solid fa-magnifying-glass-plus";
    recordZoomBtn.name = result.attributes[mainAttribute];
    recordZoomBtn.title = "Zoom to feature";

    // action buttons append to record card
    let actionBtns = document.createElement("div");

    recordHighlightBtn.appendChild(recordHighlightIcon);
    recordZoomBtn.appendChild(recordZoomIcon);
    actionBtns.appendChild(recordHighlightBtn);
    actionBtns.appendChild(recordZoomBtn);
    recordCards.appendChild(actionBtns);
    recordsContainer.appendChild(recordCards);
    resultDiv.appendChild(recordsContainer);
  });
  recordsZmBtn(results);
  highltBtn(results);
}

// function to zoom to records result
function recordsZmBtn(result) {
  layerNM();
  let cardZoomBtn = document.querySelectorAll(".zoomRecBtn");
  cardZoomBtn.forEach((record) => {
    record.addEventListener("click", () => {
      if (result.geometryType === "point") {
        view.goTo({
          target: result.features.find(
            (feature) => feature.attributes[mainAttribute] === record.name,
          ).geometry,
          zoom: 20,
        });
      } else if (result.geometryType === "polygon") {
        view.goTo(
          result.features.find(
            (feature) => feature.attributes[mainAttribute] === record.name,
          ).geometry,
        );
      }
    });
  });
}

// function to highlight records result
const graphicsLayer = new GraphicsLayer();
let highlightActive = false;
myMap.add(graphicsLayer);
function highltBtn(result) {
  let highlightBtn = document.querySelectorAll(".highlightRecBtn");
  highlightBtn.forEach((record) => {
    record.addEventListener("click", () => {
      const records = result.features.find(
        (feature) => feature.attributes[mainAttribute] === record.name,
      ).geometry;

      let graphic;
      if (result.geometryType === "polygon") {
        graphic = new Graphic({
          geometry: records,
          symbol: {
            type: "simple-fill",
            color: [33, 150, 243, 0.2],
            outline: {
              color: [255, 255, 255, 0.8],
              width: 2,
            },
          },
        });
      } else if (result.geometryType === "point") {
        graphic = new Graphic({
          geometry: records,
          symbol: {
            type: "simple-marker",
            color: [33, 150, 243, 0.9],
            size: 9,
            outline: {
              color: [0, 0, 0, 1],
              width: 1,
            },
          },
        });
      }
      graphicsLayer.removeAll();
      graphicsLayer.add(graphic);
    });
  });
}

// function to remove records result
function recordsClear() {
  let recordContan = document.querySelector("#recordsCont");
  if (recordContan) {
    recordContan.remove();
    graphicsLayer.removeAll();
  }
}

// function for attribute layerName catch
function layerNM() {
  if (layerNm === "States") {
    mainAttribute = "state_name";
  } else {
    mainAttribute = "areaname";
  }
  return mainAttribute;
}

// Zoom to records all extent that return from query
let zoomAllExt = document.querySelector(".zoomAll");
function zoomAllRec(lyID) {
  zoomAllExt.addEventListener("click", async () => {
    //Query
    const featureLayer = new FeatureLayer({
      url: url + "/" + lyID,
    });

    const result = await featureLayer.queryExtent({
      where: finalQuery.join(" AND "),
    });
    view.goTo(result.extent);
  });
}

let identifyHandle = null;
const identify = identifyModule.identify;
// popup function identify tool
function identifyTool() {
  const identifyBtn = document.createElement("button");

  identifyBtn.textContent = "X";
  identifyBtn.id = "identifyBtn";
  identifyBtn.title = "Identify tool";

  view.ui.add(identifyBtn, "top-left");

  identifyBtn.addEventListener("click", () => {
    identifyBtn.classList.toggle("activeID");

    if (identifyBtn.classList.contains("activeID")) {
      console.log("Identify tool activated");

      identifyHandle = view.on("click", async (event) => {
        const params = new IdentifyParameters({
          geometry: event.mapPoint,
          mapExtent: view.extent,
          width: view.width,
          height: view.height,
          tolerance: 5,
          returnGeometry: false,
          layerOption: "visible",
          layerIds: [0, 2],
        });

        try {
          const response = await identify(layer.url, params);

          if (response.results.length > 0) {
            const features = response.results.map((result) => {
              const feature = result.feature;

              let finalff = Object.keys(feature.attributes).filter((attb) => {
                const field = attb.toLowerCase();
                return !field.includes("shape") && !field.includes("objectid");
              });

              feature.popupTemplate = {
                title: result.layerName,

                content: [
                  {
                    type: "fields",
                    fieldInfos: finalff.map((fieldName) => ({
                      fieldName: fieldName,
                      label: fieldName,
                      visible: true,
                    })),
                  },
                ],
              };

              return feature;
            });

            view.openPopup({
              features,
              location: event.mapPoint,
            });
          } else {
            view.closePopup();
          }
        } catch (error) {
          console.error("Identify request failed:", error);
        }
      });
    } else {
      console.log("Identify tool deactivated");

      identifyHandle?.remove();
      identifyHandle = null;

      view.closePopup();
    }
  });
}
