import React from 'react';
import { Row, Col, Alert, Dropdown } from 'react-bootstrap';

export default class TimespanOrPointInTimeNotAvailable extends React.Component {
  render() {
    return (
      <div>
        <Dropdown.Divider />
        <Row>
          <Col>
            <Alert variant="danger">
              Der ausgewählte Zeitpunkt/Zeitrahmen ist leider nicht verfügbar. Bitte aktualisieren Sie die Seite. Eventuell müssen Sie im Menüpunkt
              Datenquellen die Query anpassen.
            </Alert>
          </Col>
        </Row>
      </div>
    );
  }
}
