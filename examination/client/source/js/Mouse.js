function Mouse(){
  this.draggedObject = null;

  this.mouseup = function() {
    this.draggedObject = null;
  };

  this.mousemove = function(e) {

    //console.log(this.draggedObject)
    if (this.draggedObject !== null) {

      console.log("DRAG",this.draggedObject)

      //this.draggedObject.classList.addClass("dragging");
      this.draggedObject.element.style.left = e.offsetX;
      this.draggedObject.element.style.top = e.offsetY;
    }
  }

  document.addEventListener("mouseup", this.mouseup.bind(this));
  document.addEventListener("mousemove", this.mousemove.bind(this));

  return this;
  // this.selected = null;
  // this.move = function(event) {
  //   console.log("move", this)
  //
  //   // if (this.selected) {
  //   //   this.selected.style.left = event.offsetX + "px";
  //   // }
  // }
  //
  //
  // //window.addEventListener("mousemove");
  //
  // return this;
};

module.exports = Mouse;
