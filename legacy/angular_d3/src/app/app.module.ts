import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSliderModule} from '@angular/material/slider';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule, MatRadioModule} from '@angular/material';
import {MatInputModule} from '@angular/material';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {HttpClientModule} from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {DragDropModule, DragDropRegistry, CdkDragPlaceholder, CDK_DRAG_CONFIG} from '@angular/cdk/drag-drop';

import 'hammerjs';

//

import { CubismIO } from "./cubismIO/cubism.component";
import { ControllPanel } from "./controllpanell/controllpanel.component";
import { DatasourceCtrlComponent } from './datasource-ctrl/datasource-ctrl.component';


@NgModule({
  declarations: [
    AppComponent,
    CubismIO,
    ControllPanel,
    DatasourceCtrlComponent,
  ],
    imports: [
        BrowserModule,
        FormsModule,
        ColorPickerModule,
        BrowserAnimationsModule,
        MatSliderModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatInputModule,
        MatTabsModule,
        MatToolbarModule,
        HttpClientModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        DragDropModule,
        MatRadioModule,
    ],

  providers: [MatIconRegistry],
  bootstrap: [AppComponent]
})
export class AppModule { }
