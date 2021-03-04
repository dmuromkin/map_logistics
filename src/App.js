import React, { Component} from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import TileArcGISRest from "ol/source/TileArcGISRest";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { List, Modal, Divider, Button } from "antd";
import MousePosition from "ol/control/MousePosition";
import { createStringXY } from "ol/coordinate";
import { defaults as defaultControls } from "ol/control";
import { connect } from "react-redux";
import { Layout } from "antd";
import "./App.css";
import "ol/ol.css";
import "antd/dist/antd.css";
import { MapComponent } from "@terrestris/react-geo";
import MyTable from "./layersTable";
import { fromLonLat, toLonLat } from "ol/proj";



const { Sider, Content } = Layout;

let mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: "EPSG:4326",
});

const center = [4181375.872313928, 7514318.29293211];

var layerNames = [
  "Водопровод",
  "Канализация",
  "Тепловая сеть",
  "Электрическая сеть",
];

var layers = [
  new TileLayer({
    source: new OSM(),
  }),
];
var i;
var urls = [
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_water_tile/MapServer/",
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_sewerage_tile/MapServer",
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_heat_tile/MapServer/",
  "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_energy_tile/MapServer/",
];

let extent = [
  4098520.106899999,
  7392801.4089,
  4225527.205200002,
  7561700.2141999975,
];

for (i = 0; i < layerNames.length; ++i) {
  layers.push(
    new TileLayer({
      visible: true,
      extent: extent,
      source: new TileArcGISRest({
        url: urls[i],
      }),
    })
  );
}

const map = new OlMap({
  controls: defaultControls().extend([mousePositionControl]),
  view: new OlView({
    center: center,
    zoom: 15,
  }),
  layers: layers,
});

function AddPoint(store, evt) {
  store.onClear()
  let x = evt.coordinate[0];
  let y = evt.coordinate[1];
  let id, name, workmode, guid;
  let extent = [x - 7, y - 7, x + 7, y + 7];
  let newpoint = [x.toString(), y.toString()];
  let request =
    "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_heat_tile/MapServer/11/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A" +
    extent[0] +
    "%2C%22ymin%22%3A" +
    extent[1] +
    "%2C%22xmax%22%3A" +
    extent[2] +
    "%2C%22ymax%22%3A" +
    extent[3] +
    "%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=objectid%2Cid%2Cworkmode%2Cname%2Cid_area%2Cishighway%2Cguid%2Celement_type%2Cidownernetwork&outSR=102100";
  fetch(request)
    .then((response) => response.json())
    .then((response) => {
      if (response.features[0] !== undefined){
        id = response.features[0].attributes.id;
        name = response.features[0].attributes.name;
        workmode = response.features[0].attributes.workmode;
        newpoint.push(id, name, workmode, guid);
        store.onAddPoint(newpoint);
      }
      else console.log('undefied')
    });
}

function Identify(evt)
{
  let x = evt.coordinate[0];
  let y = evt.coordinate[1];
  console.log(x,y)
  var url = "https://85.142.148.146:6443/arcgis/rest/services/test/Rkii_arcgis_dev_heat_tile/MapServer/identify?geometry=%7Bx%3A+"+x+"%2C+y%3A+"+y+"%7D&geometryType=esriGeometryPoint&sr=&layers=&layerDefs=&time=&layerTimeOptions=&tolerance=1&mapExtent="+(x-1)+"%2C"+(y-1)+"%2C"+(x+1)+"%2"+(y+1)+"%2C&imageDisplay=60%2C55%2C6&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson"
  fetch(url)
  .then((response) => response.json())
  .then((response) => {
    console.log(url)
    console.log(response)
  });
 

}

function changeVis(name) {
  var index = layerNames.indexOf(name) + 1;
  let curState = layers[index].getVisible();
  layers[index].setVisible(!curState);
}
function open(isVis) {
  isVis.setState({ vis: !isVis.state.vis })
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vis: false,
    };
  }
 
  render() {
    let store = this.props;
    let isvis = this
    map.once("click", function (evt) {
      AddPoint(store, evt);
      Identify(evt)
      //open(isvis)
      evt.preventDefault();
    });
    return (
      <div className="App">
        <Layout>
          <Sider width="160" theme="light">
            <Divider orientation="left">Слои</Divider>
            <List
              size="small"
              bordered
              dataSource={layerNames}
              renderItem={(item) => (
                <List.Item onClick={() => changeVis(item)}>{item}</List.Item>
              )}
            />
          </Sider>
          <Content>
            <Modal
              width="50%"
              visible={this.state.vis}
              onOk={()=>this.setState({ vis: !this.state.vis })}
              onCancel={()=>this.setState({ vis: !this.state.vis })}
            >
               <MyTable store={store} length={store.currState.length} />
            </Modal>
            <div className="mapField">
              <MapComponent
                map={map}
              />
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}
export default connect(
  (state) => ({
    currState: state,
  }),
  (dispatch) => ({
    onAddPoint: (newpoint) => {
      dispatch({ type: "ADD_POINT", payload: newpoint });
    },
    onClear: () => {
      dispatch({ type: "USER_LOGOUT"});
    },
  })
)(App);

/*<Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
<p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal> */
