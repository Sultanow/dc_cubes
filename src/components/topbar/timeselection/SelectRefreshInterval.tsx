import React from 'react';
import { Form } from 'react-bootstrap';

function SelectRefreshInterval (props) {
    return (
		<Form.Group>
			<Form.Control className="gap" type="number" name="refreshInterval" min="1" max="999" value={props.refreshInterval} onChange={props.handleRefreshChange}/>
			<Form.Control className="gap" as="select" name="refreshTimeUnit" value={props.refreshTimeUnit} onChange={props.handleRefreshChange}>
				<option value="seconds">Sekunden</option>
				<option value="minutes">Minuten</option>
				<option value="hours">Stunden</option>
			</Form.Control>
			<Form.Check
				className="gap"
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
	)
}

export default SelectRefreshInterval