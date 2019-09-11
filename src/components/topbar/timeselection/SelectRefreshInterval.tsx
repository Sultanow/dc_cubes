import React from 'react'
import { Form, Container } from 'react-bootstrap'
import './SelectRefreshInterval.css'

function SelectRefreshInterval (props) {
    return (
		<Container>
			<Form.Group>
				<Form.Control className="gap-refresh-interval" type="number" name="refreshInterval" min="1" max="999" value={props.refreshInterval} onChange={props.handleRefreshChange}/>
				<Form.Control className="gap-refresh-interval" as="select" name="refreshTimeUnit" value={props.refreshTimeUnit} onChange={props.handleRefreshChange}>
					<option value="seconds">Sekunden</option>
					<option value="minutes">Minuten</option>
					<option value="hours">Stunden</option>
				</Form.Control>
				<Form.Check
					className="gap-refresh-interval"
					custom
					inline
					label="Automatisch aktualisieren"
					type="checkbox"
					id="automaticRefresh"
					name="automaticRefresh"
					checked={props.automaticRefresh}
					onChange={props.handleRefreshChange}
				/>
			</Form.Group>
		</Container>
	)
}

export default SelectRefreshInterval