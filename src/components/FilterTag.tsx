import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export class FilterTag extends Component {
   render() {
      return (
         <div>
            <div className="filter-tag">
               <span>cpu_workload > 0.4</span>
               <button className="delete-filter-tag-btn">
                  <FontAwesomeIcon icon={faTimes} />
               </button>
            </div>
         </div>
      )
   }
}

export default FilterTag
