//calc basis is set to one hour in QueueMetrics
export let timeWindow = 5;  

//predictions index
export let predictionsIndex = 'queues';

export let xmlTestValue =  `<?xml version="1.0" encoding="UTF-8"?><asset id="2136928" version="1" currversion="0" content_version="1" id_extern="bsh:cmd.temp-product-HEZ638170" name="HEZ638170" type="temp." application="default" state="0" deletion="0" modified_by="143" domain="root." domain2="root." modified_date="2020-03-06T14:28:06.689Z" non_owner_access="2" iscancellation="0" has_master_file="0" has_update_geometry="0" storage_state="0" created_by="143" creation_date="2018-12-13T16:01:19Z" rowid="AAAYhrAACAAPRzRAAe" usn="0" tcn="67" ccn="68" xmlns:corpus="http://www.censhare.com/xml/3.0.0/corpus" xmlns:new-val="http://www.censhare.com/xml/3.0.0/new-val" xmlns:new-fct="http://www.censhare.com/xml/3.0.0/new-fct"><asset_feature sid="3078095233" asset_id="2136928" asset_currversion="0" feature="bsh:cmd.import-date" isversioned="0" timestamp="2020-03-06T14:28:06Z" party="143" value_timestamp="2020-03-06T14:28:06.690Z" rowid="AAAYl1AAFAACb/HAAX"/><asset_feature sid="3078095232" asset_id="2136928" asset_currversion="0" feature="bsh:cmd.importer-type" isversioned="0" timestamp="2020-03-06T14:28:06Z" party="143" value_string="ap" rowid="AAAYl1AAFAACbzvABH"/><asset_feature sid="3078095234" asset_id="2136928" asset_currversion="0" feature="bsh:cmd.import-server" isversioned="0" timestamp="2020-03-06T14:28:06Z" party="143" value_string="css01" rowid="AAAYl1AAFAACbzvABI"/><asset_feature sid="5402962336" asset_id="2136928" asset_version="1" feature="bsh:cmd.processing-status" isversioned="1" timestamp="2021-02-04T13:30:28Z" party="143" value_key="done" rowid="AAAYl1AAZAAP46WAAZ"/><asset_feature sid="3078095237" asset_id="2136928" asset_currversion="0" feature="bsh:cmd.record" isversioned="0" timestamp="2020-03-06T14:28:06Z" party="143" rowid="AAAYl1AAFAACbwfAAc"><xmldata><PRODUCT change_type="I" matnr="HEZ638170" CREATE_TIME="20200306T152302">
<TABLE name="/BSHM/AP_LADAT">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="UGRP">AL</F>
        <F name="MMSTA">GL</F>
        <F name="MMSTD">2019-12-09</F>
        <F name="VERTRIKZ">X</F>
        <F name="VTFREIGSTAT"/>
        <F name="TECHNIKZ"/>
        <F name="TYPEKZ">X</F>
        <F name="LDSTAT">4</F>
        <F name="KDLZKZ"/>
        <F name="START_SALES">2015-02-06</F>
        <F name="END_SALES">2019-12-03</F>
        <F name="END_SALES2">2019-12-03</F>
        <F name="RESTKZ"/>
        <F name="SPRED"/>
        <F name="SDCPRED"/>
        <F name="SSUCC"/>
        <F name="VPROG"/>
        <F name="HAUPTLAND"/>
        <F name="ANNUAL_QUANT">1.0</F>
        <F name="LAUNCH_QUANT">1.0</F>
        <F name="VAT_IND"/>
        <F name="SPRED_MAN"/>
        <F name="PLAN_ERLOES">0.0</F>
        <F name="WAERS_ERLOES"/>
        <F name="KEP_KUNNR"/>
        <F name="SCORE_ABC"/>
        <F name="SALRES"/>
        <F name="ALTI"/>
        <F name="PLAN_QUANT">1.0</F>
        <F name="MMSTA_MAN"/>
        <F name="CONF_INDEX"/>
        <F name="PLAN_ERLOES_L">0.0</F>
        <F name="WAERS_ERLOES_L"/>
        <F name="START_SALES_FR">2015-02-06</F>
        <F name="NOTE"/>
        <F name="CTAX"/>
        <F name="MODIFICATION"/>
        <F name="LDSTAT_REQ"/>
    </ROW>
   
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="UGRP">DK</F>
        <F name="MMSTA">GG</F>
        <F name="MMSTD">2020-01-29</F>
        <F name="VERTRIKZ">X</F>
        <F name="VTFREIGSTAT"/>
        <F name="TECHNIKZ">X</F>
        <F name="TYPEKZ">X</F>
        <F name="LDSTAT">3</F>
        <F name="KDLZKZ"/>
        <F name="START_SALES">2020-01-29</F>
        <F name="END_SALES">0000-00-00</F>
        <F name="END_SALES2">0000-00-00</F>
        <F name="RESTKZ"/>
        <F name="SPRED"/>
        <F name="SDCPRED"/>
        <F name="SSUCC"/>
        <F name="VPROG"/>
        <F name="HAUPTLAND"/>
        <F name="ANNUAL_QUANT">5.0</F>
        <F name="LAUNCH_QUANT">1.0</F>
        <F name="VAT_IND">1</F>
        <F name="SPRED_MAN"/>
        <F name="PLAN_ERLOES">0.0</F>
        <F name="WAERS_ERLOES"/>
        <F name="KEP_KUNNR"/>
        <F name="SCORE_ABC"/>
        <F name="SALRES"/>
        <F name="ALTI"/>
        <F name="PLAN_QUANT">5.0</F>
        <F name="MMSTA_MAN"/>
        <F name="CONF_INDEX"/>
        <F name="PLAN_ERLOES_L">0.0</F>
        <F name="WAERS_ERLOES_L"/>
        <F name="START_SALES_FR">2020-01-29</F>
        <F name="NOTE"/>
        <F name="CTAX"/>
        <F name="MODIFICATION"/>
        <F name="LDSTAT_REQ"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="UGRP">EE</F>
        <F name="MMSTA">GG</F>
        <F name="MMSTD">2020-01-29</F>
        <F name="VERTRIKZ">X</F>
        <F name="VTFREIGSTAT"/>
        <F name="TECHNIKZ">X</F>
        <F name="TYPEKZ">X</F>
        <F name="LDSTAT">3</F>
        <F name="KDLZKZ"/>
        <F name="START_SALES">2020-01-31</F>
        <F name="END_SALES">0000-00-00</F>
        <F name="END_SALES2">0000-00-00</F>
        <F name="RESTKZ"/>
        <F name="SPRED"/>
        <F name="SDCPRED"/>
        <F name="SSUCC"/>
        <F name="VPROG"/>
        <F name="HAUPTLAND"/>
        <F name="ANNUAL_QUANT">5.0</F>
        <F name="LAUNCH_QUANT">1.0</F>
        <F name="VAT_IND">1</F>
        <F name="SPRED_MAN"/>
        <F name="PLAN_ERLOES">0.0</F>
        <F name="WAERS_ERLOES"/>
        <F name="KEP_KUNNR"/>
        <F name="SCORE_ABC"/>
        <F name="SALRES"/>
        <F name="ALTI"/>
        <F name="PLAN_QUANT">5.0</F>
        <F name="MMSTA_MAN"/>
        <F name="CONF_INDEX"/>
        <F name="PLAN_ERLOES_L">0.0</F>
        <F name="WAERS_ERLOES_L"/>
        <F name="START_SALES_FR">2020-01-31</F>
        <F name="NOTE"/>
        <F name="CTAX"/>
        <F name="MODIFICATION"/>
        <F name="LDSTAT_REQ"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="UGRP">ES</F>
        <F name="MMSTA">GG</F>
        <F name="MMSTD">2016-05-16</F>
        <F name="VERTRIKZ">X</F>
        <F name="VTFREIGSTAT"/>
        <F name="TECHNIKZ">X</F>
        <F name="TYPEKZ">X</F>
        <F name="LDSTAT">3</F>
        <F name="KDLZKZ"/>
        <F name="START_SALES">2015-07-31</F>
        <F name="END_SALES">0000-00-00</F>
        <F name="END_SALES2">0000-00-00</F>
        <F name="RESTKZ"/>
        <F name="SPRED"/>
        <F name="SDCPRED"/>
        <F name="SSUCC"/>
        <F name="VPROG"/>
        <F name="HAUPTLAND"/>
        <F name="ANNUAL_QUANT">30.0</F>
        <F name="LAUNCH_QUANT">3.0</F>
        <F name="VAT_IND">1</F>
        <F name="SPRED_MAN"/>
        <F name="PLAN_ERLOES">0.0</F>
        <F name="WAERS_ERLOES"/>
        <F name="KEP_KUNNR"/>
        <F name="SCORE_ABC"/>
        <F name="SALRES"/>
        <F name="ALTI"/>
        <F name="PLAN_QUANT">30.0</F>
        <F name="MMSTA_MAN"/>
        <F name="CONF_INDEX"/>
        <F name="PLAN_ERLOES_L">0.0</F>
        <F name="WAERS_ERLOES_L"/>
        <F name="START_SALES_FR">2015-07-31</F>
        <F name="NOTE"/>
        <F name="CTAX"/>
        <F name="MODIFICATION"/>
        <F name="LDSTAT_REQ"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="UGRP">FI</F>
        <F name="MMSTA">GG</F>
        <F name="MMSTD">2020-01-29</F>
        <F name="VERTRIKZ">X</F>
        <F name="VTFREIGSTAT"/>
        <F name="TECHNIKZ">X</F>
        <F name="TYPEKZ">X</F>
        <F name="LDSTAT">3</F>
        <F name="KDLZKZ"/>
        <F name="START_SALES">2020-01-31</F>
        <F name="END_SALES">0000-00-00</F>
        <F name="END_SALES2">0000-00-00</F>
        <F name="RESTKZ"/>
        <F name="SPRED"/>
        <F name="SDCPRED"/>
        <F name="SSUCC"/>
        <F name="VPROG"/>
        <F name="HAUPTLAND"/>
        <F name="ANNUAL_QUANT">5.0</F>
        <F name="LAUNCH_QUANT">1.0</F>
        <F name="VAT_IND">1</F>
        <F name="SPRED_MAN"/>
        <F name="PLAN_ERLOES">0.0</F>
        <F name="WAERS_ERLOES"/>
        <F name="KEP_KUNNR"/>
        <F name="SCORE_ABC"/>
        <F name="SALRES"/>
        <F name="ALTI"/>
        <F name="PLAN_QUANT">5.0</F>
        <F name="MMSTA_MAN"/>
        <F name="CONF_INDEX"/>
        <F name="PLAN_ERLOES_L">0.0</F>
        <F name="WAERS_ERLOES_L"/>
        <F name="START_SALES_FR">2020-01-31</F>
        <F name="NOTE"/>
        <F name="CTAX"/>
        <F name="MODIFICATION"/>
        <F name="LDSTAT_REQ"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="UGRP">FR</F>
        <F name="MMSTA">GL</F>
        <F name="MMSTD">2018-02-20</F>
        <F name="VERTRIKZ">X</F>
        <F name="VTFREIGSTAT"/>
        <F name="TECHNIKZ"/>
        <F name="TYPEKZ">X</F>
        <F name="LDSTAT">4</F>
        <F name="KDLZKZ"/>
        <F name="START_SALES">2015-02-01</F>
        <F name="END_SALES">2018-02-14</F>
        <F name="END_SALES2">2018-02-14</F>
        <F name="RESTKZ"/>
        <F name="SPRED"/>
        <F name="SDCPRED"/>
        <F name="SSUCC"/>
        <F name="VPROG"/>
        <F name="HAUPTLAND"/>
        <F name="ANNUAL_QUANT">200.0</F>
        <F name="LAUNCH_QUANT">1.0</F>
        <F name="VAT_IND">1</F>
        <F name="SPRED_MAN"/>
        <F name="PLAN_ERLOES">0.0</F>
        <F name="WAERS_ERLOES"/>
        <F name="KEP_KUNNR"/>
        <F name="SCORE_ABC"/>
        <F name="SALRES"/>
        <F name="ALTI"/>
        <F name="PLAN_QUANT">200.0</F>
        <F name="MMSTA_MAN"/>
        <F name="CONF_INDEX"/>
        <F name="PLAN_ERLOES_L">0.0</F>
        <F name="WAERS_ERLOES_L"/>
        <F name="START_SALES_FR">2015-02-01</F>
        <F name="NOTE"/>
        <F name="CTAX"/>
        <F name="MODIFICATION"/>
        <F name="LDSTAT_REQ"/>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_MCAETXTDRA"/>
<TABLE name="/BSHM/AP_MCAETXTPIC"/>
<TABLE name="/BSHM/AP_MCTYPD"/>
<TABLE name="/BSHM/AP_MCTYPP"/>
<TABLE name="/BSHM/AP_MCTYPS">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="OUTLDTYPE"/>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_MEDIA">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="PICTSELECTION">REF</F>
        <F name="PICTREF">HZ638100</F>
        <F name="PICTVOANNEX"/>
        <F name="PICTAVDATE">2014-09-02</F>
        <F name="DRAWSELECTION">NOD</F>
        <F name="DRAWREF"/>
        <F name="DRAWAVDATE">0000-00-00</F>
        <F name="DAREDAC">2014-12-01</F>
        <F name="DAREDASI">2014-12-01</F>
        <F name="DARECO">X</F>
        <F name="DARESI">X</F>
        <F name="DASIBLOCK"/>
        <F name="PICTRELEASE">X</F>
        <F name="PDFDATETRANSF">0000-00-00</F>
        <F name="DRAWRELEASE">X</F>
        <F name="ATTACHMENT"/>
        <F name="OUTDSELECTION"/>
        <F name="PICTRELEASE14"/>
        <F name="PICTSEL15"/>
        <F name="PICTTYPP15"/>
        <F name="PICTREF15"/>
        <F name="PICTAVDATE15">0000-00-00</F>
        <F name="PICTRELEASE15"/>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_NACHTRA"/>
<TABLE name="/BSHM/AP_ST_BOMS"/>
<TABLE name="/BSHM/AP_VPAUSP">
    <ROW>
        <F name="MANDT">060</F>
        <F name="CUOBJ">000000000002965874</F>
        <F name="ATINN">0000004176</F>
        <F name="ATZHL">001</F>
        <F name="OBJEK">HEZ638170</F>
        <F name="ADZHL">0000</F>
        <F name="ATWRT">EDS</F>
        <F name="KLART">001</F>
        <F name="MAFID">O</F>
        <F name="ATFLV">0</F>
        <F name="ATAWE"/>
        <F name="ATFLB">0</F>
        <F name="ATAW1"/>
        <F name="ATNAM">GERAETEFARBE_460</F>
        <F name="ATFOR">CHAR</F>
        <F name="ATINT"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="CUOBJ">000000000002965874</F>
        <F name="ATINN">0000018694</F>
        <F name="ATZHL">001</F>
        <F name="OBJEK">HEZ638170</F>
        <F name="ADZHL">0000</F>
        <F name="ATWRT">N</F>
        <F name="KLART">001</F>
        <F name="MAFID">O</F>
        <F name="ATFLV">0</F>
        <F name="ATAWE"/>
        <F name="ATFLB">0</F>
        <F name="ATAW1"/>
        <F name="ATNAM">DAMPF_GEEIGNET</F>
        <F name="ATFOR">CHAR</F>
        <F name="ATINT"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="CUOBJ">000000000002965874</F>
        <F name="ATINN">0000010249</F>
        <F name="ATZHL">002</F>
        <F name="OBJEK">HEZ638170</F>
        <F name="ADZHL">0000</F>
        <F name="ATWRT">UA1</F>
        <F name="KLART">001</F>
        <F name="MAFID">O</F>
        <F name="ATFLV">0</F>
        <F name="ATAWE"/>
        <F name="ATFLB">0</F>
        <F name="ATAW1"/>
        <F name="ATNAM">ZUBEHOERART</F>
        <F name="ATFOR">CHAR</F>
        <F name="ATINT"/>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_VPMAKT">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">0</F>
        <F name="MAKTX">Teleskop. vođice na izvlačenje - 1 nivo</F>
        <F name="MAKTG">TELESKOP. VOĐICE NA IZVLAČENJE - 1 NIVO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">2</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">3</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">4</F>
        <F name="MAKTX">Suport. telesc, 2 nivel, compl. extens.</F>
        <F name="MAKTG">SUPORT. TELESC, 2 NIVEL, COMPL. EXTENS.</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">5</F>
        <F name="MAKTX">Enonivoj. telesk. izvlečna vodila, pyro</F>
        <F name="MAKTG">ENONIVOJ. TELESK. IZVLEČNA VODILA, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">6</F>
        <F name="MAKTX">Potpuno teleskopski izvlačni sistem</F>
        <F name="MAKTG">POTPUNO TELESKOPSKI IZVLAČNI SISTEM</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">9</F>
        <F name="MAKTX">1-tasandilised teleskoopsiinid</F>
        <F name="MAKTG">1-TASANDILISED TELESKOOPSIINID</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">B</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">C</F>
        <F name="MAKTX">1násobný teleskopický výsuv</F>
        <F name="MAKTG">1NÁSOBNÝ TELESKOPICKÝ VÝSUV</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">D</F>
        <F name="MAKTX">Teleskop-Vollauszug 1-fach, pyrolysef.</F>
        <F name="MAKTG">TELESKOP-VOLLAUSZUG 1-FACH, PYROLYSEF.</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">E</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">F</F>
        <F name="MAKTX">RAIL TELESCOPIQUE 1NIVEAU SORTIE TOTALE</F>
        <F name="MAKTG">RAIL TELESCOPIQUE 1NIVEAU SORTIE TOTALE</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">G</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">H</F>
        <F name="MAKTX">Teleszkópos sütősín, 1-szeres</F>
        <F name="MAKTG">TELESZKÓPOS SÜTŐSÍN, 1-SZERES</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">I</F>
        <F name="MAKTX">Set griglie telesc.1 liv.ad estraz.compl</F>
        <F name="MAKTG">SET GRIGLIE TELESC.1 LIV.AD ESTRAZ.COMPL</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">K</F>
        <F name="MAKTX">1 fag teleskop udtræk</F>
        <F name="MAKTG">1 FAG TELESKOP UDTRÆK</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">L</F>
        <F name="MAKTX">Prowadnica teleskop., 1-częściowa profi</F>
        <F name="MAKTG">PROWADNICA TELESKOP., 1-CZĘŚCIOWA PROFI</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">N</F>
        <F name="MAKTX">Telescopisch uittreksysteem op 1 niveau</F>
        <F name="MAKTG">TELESCOPISCH UITTREKSYSTEEM OP 1 NIVEAU</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">O</F>
        <F name="MAKTX">Teleskoputtrekk x 1, fullt uttrekk</F>
        <F name="MAKTG">TELESKOPUTTREKK X 1, FULLT UTTREKK</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">P</F>
        <F name="MAKTX">Railes telescópicos com 1 nível</F>
        <F name="MAKTG">RAILES TELESCÓPICOS COM 1 NÍVEL</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">Q</F>
        <F name="MAKTX">1-násobný plne teleskopický výsuv</F>
        <F name="MAKTG">1-NÁSOBNÝ PLNE TELESKOPICKÝ VÝSUV</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">R</F>
        <F name="MAKTX">Телескопические направляющие, 1 уровня,</F>
        <F name="MAKTG">ТЕЛЕСКОПИЧЕСКИЕ НАПРАВЛЯЮЩИЕ, 1 УРОВНЯ,</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">S</F>
        <F name="MAKTX">Guías telescópicas 1 nivel</F>
        <F name="MAKTG">GUÍAS TELESCÓPICAS 1 NIVEL</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">T</F>
        <F name="MAKTX">Teleskop çekmece, 1'lü</F>
        <F name="MAKTG">TELESKOP ÇEKMECE, 1'LÜ</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">U</F>
        <F name="MAKTX">Teleskooppikannattimet, 1-tasoiset</F>
        <F name="MAKTG">TELESKOOPPIKANNATTIMET, 1-TASOISET</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">V</F>
        <F name="MAKTX">Teleskoputdrag x 2, fullt utdragbara</F>
        <F name="MAKTG">TELESKOPUTDRAG X 2, FULLT UTDRAGBARA</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">W</F>
        <F name="MAKTX">Пълно телескопично изтегляне, единично</F>
        <F name="MAKTG">ПЪЛНО ТЕЛЕСКОПИЧНО ИЗТЕГЛЯНЕ, ЕДИНИЧНО</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">X</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">Y</F>
        <F name="MAKTX">1 level telescopic rail, full ext, pyro</F>
        <F name="MAKTG">1 LEVEL TELESCOPIC RAIL, FULL EXT, PYRO</F>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="SPRAS">d</F>
        <F name="MAKTX">Pribor za ugradnu rernu</F>
        <F name="MAKTG">PRIBOR ZA UGRADNU RERNU</F>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_VPMARA">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="ERSDA">2013-11-12</F>
        <F name="ERNAM">SCHREINER-M</F>
        <F name="LAEDA">2020-02-26</F>
        <F name="AENAM">BT</F>
        <F name="LVORM"/>
        <F name="MTART">YSAP</F>
        <F name="BISMT"/>
        <F name="MEINS">ST</F>
        <F name="BRGEW">1.9</F>
        <F name="NTGEW">1.412</F>
        <F name="GEWEI">KG</F>
        <F name="VOLUM">10.455</F>
        <F name="VOLEH">CDM</F>
        <F name="EAN11">4242002810119</F>
        <F name="NUMTP">02</F>
        <F name="LAENG">41.0</F>
        <F name="BREIT">30.0</F>
        <F name="HOEHE">8.5</F>
        <F name="MEABM">CM</F>
        <F name="BEGRU"/>
        <F name="PMATA"/>
        <F name="MSTAE">G</F>
        <F name="MSTAV">G</F>
        <F name="MSTDE">2014-12-01</F>
        <F name="MSTDV">2014-12-01</F>
        <F name="MFRPN">HZ610</F>
        <F name="MFRNR">0001000011</F>
        <F name="/BSHM/BMRK">A01</F>
        <F name="/BSHM/GFELD">M51</F>
        <F name="/BSHM/BART">Z</F>
        <F name="/BSHM/PFAM"/>
        <F name="/BSHM/PGRP">Z</F>
        <F name="/BSHM/GGR">M51TRT</F>
        <F name="/BSHM/GART">071</F>
        <F name="/BSHM/TYPE"/>
        <F name="/BSHM/ANTRST"/>
        <F name="/BSHM/GRUNDGER"/>
        <F name="/BSHM/GRUNDKZ"/>
        <F name="/BSHM/FOTOMUST"/>
        <F name="/BSHM/COMDARST"/>
        <F name="/BSHM/KDMATNR">000000000017002063</F>
        <F name="/BSHM/ZAEHLM">N</F>
        <F name="/BSHM/LOGNR">0281011</F>
        <F name="/BSHM/TECHV"/>
        <F name="/BSHM/TVTECHV"/>
        <F name="/BSHM/TECHN"/>
        <F name="/BSHM/PRODFLOTP">0000-00-00</F>
        <F name="/BSHM/PRODFLOTA">2014-12-12</F>
        <F name="/BSHM/FIRSTSHIPP">2014-12-01</F>
        <F name="/BSHM/FIRSTSHIPC">2014-12-01</F>
        <F name="/BSHM/LASTSHIPP">0000-00-00</F>
        <F name="/BSHM/LASTPROD">0000-00-00</F>
        <F name="/BSHM/ARTB2"/>
        <F name="/BSHM/BLBESCHR"/>
        <F name="/BSHM/ABWPRG"/>
        <F name="/BSHM/ZOLLHERST"/>
        <F name="/BSHM/PDM"/>
        <F name="/BSHM/ANNUALQUAN">611.0</F>
        <F name="/BSHM/LAUNCHQUAN">68.0</F>
        <F name="/BSHM/PLANLFZM">0000</F>
        <F name="/BSHM/GVANR">M14890</F>
        <F name="/BSHM/GVANRSAV"/>
        <F name="/BSHM/KDARTBEZ"/>
        <F name="/BSHM/OEMZUSTEX1"/>
        <F name="/BSHM/OEMZUSTEX2"/>
        <F name="/BSHM/ESTLOGDAT"/>
        <F name="/BSHM/BARTGRP">O</F>
        <F name="/BSHM/GERGRP">GG</F>
        <F name="/BSHM/VAVANR"/>
        <F name="/BSHM/CPH">M51930930930YYYXXX</F>
        <F name="/BSHM/BAUR">YYY</F>
        <F name="/BSHM/ZUSBEZ"/>
        <F name="/BSHM/STAWN">73182200</F>
        <F name="NORMT"/>
        <F name="/BSHM/CECED">Accessories</F>
        <F name="REPL_CSMATNR">000000000017002063</F>
        <F name="/BSHM/VALUE_CL"/>
        <F name="/BSHM/SET_TYPE"/>
        <F name="UPC"/>
        <F name="CPC"/>
        <F name="EAN_KAR"/>
        <F name="EAN_PAL"/>
        <F name="EAN_KLA"/>
        <F name="/BSHM/PD">PCG</F>
        <F name="/BSHM/ORIG_MATNR"/>
        <F name="/BSHM/MFRNRNAME1">BSH FCGT Traunreut</F>
        <F name="/BSHM/MFRNRNAME2">BSH Hausgeräte GmbH</F>
        <F name="/BSHM/MFRNRLAND1">DE</F>
        <F name="/BSHM/ZOLLHLAND1"/>
        <F name="/BSHM/PPM"/>
        <F name="/BSHM/PRODMANAG"/>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_VPMARM">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="MEINH">LAG</F>
        <F name="UMREZ">7.0</F>
        <F name="UMREN">1.0</F>
        <F name="EANNR"/>
        <F name="EAN11"/>
        <F name="NUMTP"/>
        <F name="LAENG">0.0</F>
        <F name="BREIT">0.0</F>
        <F name="HOEHE">0.0</F>
        <F name="MEABM">CM</F>
        <F name="VOLUM">0.0</F>
        <F name="VOLEH">CDM</F>
        <F name="BRGEW">0.0</F>
        <F name="GEWEI">KG</F>
        <F name="MESUB"/>
        <F name="ATINN">0000000000</F>
        <F name="MESRT">00</F>
        <F name="XFHDW"/>
        <F name="XBEWW"/>
        <F name="KZWSO"/>
        <F name="MSEHI"/>
        <F name="BFLME_MARM"/>
        <F name="GTIN_VARIANT"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="MEINH">PAL</F>
        <F name="UMREZ">48.0</F>
        <F name="UMREN">1.0</F>
        <F name="EANNR"/>
        <F name="EAN11"/>
        <F name="NUMTP"/>
        <F name="LAENG">120.0</F>
        <F name="BREIT">80.0</F>
        <F name="HOEHE">95.0</F>
        <F name="MEABM">CM</F>
        <F name="VOLUM">912.0</F>
        <F name="VOLEH">CDM</F>
        <F name="BRGEW">155.5</F>
        <F name="GEWEI">KG</F>
        <F name="MESUB"/>
        <F name="ATINN">0000000000</F>
        <F name="MESRT">00</F>
        <F name="XFHDW"/>
        <F name="XBEWW"/>
        <F name="KZWSO"/>
        <F name="MSEHI"/>
        <F name="BFLME_MARM"/>
        <F name="GTIN_VARIANT"/>
    </ROW>
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="MEINH">ST</F>
        <F name="UMREZ">1.0</F>
        <F name="UMREN">1.0</F>
        <F name="EANNR"/>
        <F name="EAN11">4242002810119</F>
        <F name="NUMTP">02</F>
        <F name="LAENG">41.0</F>
        <F name="BREIT">30.0</F>
        <F name="HOEHE">8.5</F>
        <F name="MEABM">CM</F>
        <F name="VOLUM">10.455</F>
        <F name="VOLEH">CDM</F>
        <F name="BRGEW">1.9</F>
        <F name="GEWEI">KG</F>
        <F name="MESUB"/>
        <F name="ATINN">0000000000</F>
        <F name="MESRT">00</F>
        <F name="XFHDW"/>
        <F name="XBEWW"/>
        <F name="KZWSO"/>
        <F name="MSEHI"/>
        <F name="BFLME_MARM"/>
        <F name="GTIN_VARIANT"/>
    </ROW>
</TABLE>
<TABLE name="/BSHM/AP_VPMEAN">
    <ROW>
        <F name="MANDT">060</F>
        <F name="MATNR">HEZ638170</F>
        <F name="MEINH">ST</F>
        <F name="LFNUM">00001</F>
        <F name="EAN11">4242002810119</F>
        <F name="EANTP">02</F>
        <F name="HPEAN">X</F>
    </ROW>
</TABLE>
</PRODUCT></xmldata></asset_feature><asset_feature sid="46705995" asset_id="2136928" asset_version="1" feature="censhare:owner" isversioned="1" timestamp="2018-12-13T16:01:19Z" party="143" value_long="2" rowid="AAAYl1AABAAKR8xACO"/><asset_feature sid="46705996" asset_id="2136928" asset_version="1" feature="censhare:owner" isversioned="1" timestamp="2018-12-13T16:01:19Z" party="143" value_long="143" rowid="AAAYl1AABAAKR8xACN"/><asset_feature sid="46706001" asset_id="2136928" asset_version="1" feature="censhare:uuid" isversioned="1" timestamp="2018-12-13T16:01:19Z" party="143" value_string="548b6db0-fef0-11e8-8543-0050569311c6" rowid="AAAYl1AABAAKR8xACM"/></asset>`;
