import React from "react";
import { Row, Col, Divider } from 'antd';

function MyTable(props) {
  if(props.length===0)
  {
    return(
      <div>
      <Divider orientation="left">Элемент</Divider>
      
        <Row justify="left">
          <Col className="gutter-row" span={12}>
          <div>Информация недоступна</div>
          </Col>
        </Row>
      </div>
    )
  }
  else{
  return (
    <div>
    <Divider orientation="left">Элемент</Divider>
    {props.store.currState.map((point, index) => (
      <Row justify="left" key={index}>
        <Col className="gutter-row" span={12}>
        <div id="row">coords: {point[0]}  {point[1]}</div>
        </Col>
        <Col className="gutter-row" span={12}>
        <div id="row">id: {point[2]}</div>
        </Col>
        <Col className="gutter-row" span={12}>
        <div id="row">name: {point[3]}</div>
        </Col>
        <Col className="gutter-row" span={12}>
        <div id="row">workmode: {point[4]}</div>
        </Col>
      </Row>
    ))}
    </div>
  )
    }
}
export default MyTable;