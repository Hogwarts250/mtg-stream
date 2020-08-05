$(document).ready(function() {
  $("#create_drag_btn").click(function() {
    var draggableDiv = $(document.createElement("div"))
    .css({
      "left": 0,
      "top": 50,
      "position": "absolute",
    })

    draggableDiv.append('<div class="card p-3">test</div>');

    $(draggableDiv).appendTo(".container-drag").draggable({
      containment: "window"
    });
  });
});