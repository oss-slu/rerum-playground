//Opens and closes main side menu.
function openCloseMenu() {
    var toolBar = document.styleSheets.getElementById("toolbar");
    var toolBarOpen = false;

    if(toolBarOpen == false){
        toolBar.width = "250px";
        toolBarOpen = true;
    }
    else{
        toolBar.width = "0px";
        toolBarOpen = false;
    }
}