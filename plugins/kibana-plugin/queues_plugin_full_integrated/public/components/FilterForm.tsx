import React, { Component } from 'react'
import { NONAME } from 'dns'
import {
    EuiSelect,
    EuiFormRow,
    EuiFieldText,
    EuiButton
  } from '@elastic/eui';
export class FilterForm extends Component {
    render() {
        return (
            <div style={filterFormContainer}>
                <form style={form}>
                    {/* <label>
                        <input placeholder="Input Item Name..." style={input} type="text" name="name" />
                    </label> */}
                    <EuiFormRow label="">
                        <EuiFieldText name="first" />
                    </EuiFormRow>
                    <EuiSelect
                        options={[
                            { value: 'Products', text: 'Products' },
                            { value: 'Product Relation', text: 'Product Relation' },
                            { value: 'Lorem', text: 'Lorem' },
                            { value: 'Ipsum', text: 'Ipsum' }
                        ]}
                        />
                    {/* <div className="select-container">
                        <select style={select} name="queue-type" id="queue-type">
                            <option value="Product Queues">Product Queues</option>
                            <option value="Products Relations">Products Relations</option>
                            <option value="Lorem">Lorem</option>
                            <option value="Ipsum">Ipsum</option>
                        </select>
                    </div> */}
                    {/* <button id="search-btn" style={searchBtn}>Search</button> */}
                    <EuiButton type="primary" size="m">Search</EuiButton>
                    <EuiButton type="primary" size="m">Update Predictions</EuiButton>
                    {/* <button className="prediction-btn" style={predictionBtn}>Create New Predictions</button> */}
                </form>
            </div>
        )
    }
}

export default FilterForm


const filterFormContainer = {
    backgroundColor: "#F5F9FC",
    height: "80px",
    justifyContent: "center",
    display: "flex", 
}

const input = {
    height: "40px", 
    border: "2px solid #dbdbdb", 
    borderRadius: "30px"
}

const select = {
    color: "black", 
    lineHeight: "32px",
    height: "46px",
    padding: "5px 50px 5px 20px",
    borderRadius: "30px",
    border: "2px solid #dbdbdb", 
    cursor: "pointer"
}

const searchBtn = {
    backgroundColor: "#FE9C6A",
    height: "46px",
    color: "white",
    padding: "5px 20px 5px 20px",
    cursor: "pointer", 
    fontSize: ".8rem", 
    border: "2px solid #FE9C6A",
    borderRadius: "50px"
}

const form = {
    marginTop: "auto", 
    marginBottom: "auto", 
    display: "flex"
}

const predictionBtn = {
    backgroundColor: "#F5F9FC",
    height: "30px",
    color: "black",
    cursor: "pointer", 
    fontSize: ".8rem", 
    fontWeight: "bold" as "bold",
    border: "none",
    borderBottom: "2px solid #F5F9FC",
    marginLeft: "50px", 
    marginTop: "auto", 
    marginBottom: "auto",
    
}