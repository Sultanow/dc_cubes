//calc basis is set to one hour in QueueMetrics
export let timeWindow = 5;  

export let testValue =  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE Product-Data PUBLIC "-//BSHG//PICenter Product Data 1.0//en" "picenter_input.dtd">
<Product-Data>
  <Product-Core VIB="CBG635BS3" CSMATNR="" ACCCSMATNR="" brand="A01" product-family="Ovens" business-field="M30" base-type="" central-status="G" DaReCo="yes" DaReSi="yes" DSIB="no">
    <Status-Information DaReDaC="2018-08-21" DaReDaSi="2018-08-21" PictAvDate="2018-05-23" DrawAvDate="2018-05-23"/>
    <Regional-Availability country="AT" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GG" sales-program="ANH" predecessor="CBG635BS1" successor=""/>
    <Regional-Availability country="BE" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GG" sales-program="" predecessor="CBG635BS1" successor=""/>
    <Regional-Availability country="CH" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GG" sales-program="XBL" predecessor="CBG635BS1" successor=""/>
    <Regional-Availability country="CZ" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GG" sales-program="W10" predecessor="CBG635BS1" successor=""/>
    <Regional-Availability country="DE" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GG" sales-program="DLN" predecessor="CBG635BS1" successor=""/>
    <Regional-Availability country="DE-NOLTE" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GD" sales-program="" predecessor="" successor=""/>
    <Regional-Availability country="HK" start-sales="2019-01-01" end-sales="2021-02-03" regional-status="GI" sales-program="" predecessor="" successor=""/>
    <Regional-Availability country="IT" start-sales="2019-03-31" end-sales="9999-12-31" regional-status="GG" sales-program="I11" predecessor="CBG635BS1" successor=""/>
    <Regional-Availability country="LU" start-sales="2018-09-01" end-sales="9999-12-31" regional-status="GG" sales-program="" predecessor="CBG635BS1" successor=""/>
    <PI-Release countries="CZ;DE-NOLTE;DE;AT;LU;CH;HK;BE;IT;NL;PL;SK"/>
    <PI-Properties>
      <Numeric-Property name="WIDTH_PACKED" value="650"/><Enum-Property name="WIDTH_TYPE_US" value="WIDTH_TYPE_US.24"/><Enum-Property name="WIRELESS_CAPABILITY" value="GENERAL.No"/>
      <Numeric-Property name="ZEIT_AUS" value=""/><Numeric-Property name="ZEIT_STANDBY_DISPLAY_AN" value=""/>
      <Numeric-Property name="ZEIT_STANDBY_DISPLAY_AUS" value=""/>
      <Numeric-Property name="ZEIT_STANDBY_NETZWERK" value=""/>
    </PI-Properties>
    <Media-References>
      <Standard-Image-Reference asset-id="MCSA00775061_422581_CBG635BS1_def"/>
      <Media-Reference asset-id="MCSA00775061_422581_CBG635BS1_def"/>
      <Media-Reference asset-id="MCSA00841055_474999_CBG635BS1_def"/>
      <Media-Reference asset-id="MCSA03010468_CB_CBG635BS3_Bosch_B601_EDE_PGA2_def"/>
      <Media-Reference asset-id="MCSA00841122_475019_CBG635BS1_def"/>
      <Media-Reference asset-id="MCSA03010491_CB_CBG635BS3_Bosch_B601_EDE_PGA3_def"/>
      <Media-Reference asset-id="MCSA00841688_475605_CBG635BS1_def"/>
    </Media-References>
  </Product-Core>
</Product-Data>
`;