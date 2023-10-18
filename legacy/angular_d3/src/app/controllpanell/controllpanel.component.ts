import { Component, Input, Output, EventEmitter} from '@angular/core';
import {DatasourceCtrlComponent} from "../datasource-ctrl/datasource-ctrl.component";
import {DataStatusService} from "../data-status.service";
@Component({
    selector: "my-controllpanel",
    templateUrl: './controllpanel.html',
    styleUrls: ['./controllpanel.css']
})


export class ControllPanel{

    @Input() title: String;
    @Input() filestring: String;
    @Input() instancesAddColor: String[];

    @Output() fileChanged = new EventEmitter;
    @Output() datechanged = new EventEmitter;
    @Output() colorChanged = new EventEmitter;
    @Output() updateData = new EventEmitter;

    url : string;
    query: string;
    
    constructor(private dataservice: DataStatusService){
        this.url = this.dataservice.getUrl()
        this.query = this.dataservice.getCurrentquery()
        
    
    }
    newfile(e){      
        this.fileChanged.emit(e)
        
    }

    colorchanged(e,i){
        this.colorChanged.emit({e,i})
    }

    newdate(e){
        this.datechanged.emit(e)
    }

    updatedata(){

        this.dataservice.setUrl(this.url)
        this.dataservice.setCurrentquery(this.query)
        this.updateData.emit()

        
        
        
    }



}