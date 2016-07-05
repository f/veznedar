var roots = window.roots || []

function std(str) {
  if (!str) {
    return ""
  }
  return str
  .toLocaleLowerCase()
  .replace(/[^a-zA-ZıİüÜöÖşŞğĞ\(\)âîû\s]/g, "")
  .replace(/\).\(/g, "")
}

function formal(form) {
  return std(form)
  .replace(/x/g, "f")
  .replace(/q/g, "'")
  .replace(/w/g, "l")
}

function deformal(form) {
  return std(form)
  .replace(/f/g, "x")
  .replace(/\'/g, "q")
  .replace(/l/g, "w")
}

function verb(root, form) {
  root = root.length > 3 ? findRoot(root) : root
  var word = std(form)
  .replace(/x/g, root[0]||"")
  .replace(/w/g, root[2]||"")
  .replace(/q/g, root[1]||"")
  .replace(/\(.\)/g, "")
  if (root[3]) {
    word = word.replace(/.$/, root[3])
  }
  return std(word)
}

function findRoot(word) {
  var root = std(word)
  .replace(/^m.|^t./g, "")
  .replace(/^[iı]st[iı]|^m[üu]st/, "")
  .replace(/.t$|.tun$|an$/g, "")
  .replace(/[aeiouıüö]/g, "")
  .replace(/.*(.)(.){2}(.)$/, "$1$2$3")

  var wovel = word.match(/[aeiouıüö]/)
  if (root.length == 2 && wovel) {
    root = wovel[0]+root[0]+root[1]
  }
  return root
}

function findForm(word, root) {
  root = std(root)
  var form = std(word).split("").reverse().join("")
  .replace(new RegExp(root[0]), "x")
  .replace(new RegExp(root[1]+root[1]), "qq")
  .replace(new RegExp("(.)"+root[1]+"(.)"), "$1q$2")
  .replace(new RegExp(root[2]), "w")

  var wovel = root && root[0].match(/[aeiouıüö]/)
  if (wovel) {
    form = form.replace(/x/g, "("+wovel[0]+")x")
  }
  return form.split("").reverse().join("")
}

$("#word").on("input", function () {
  var root = findRoot($(this).val())
  var form = findForm($(this).val(), root)
  $("#root").val(root).data('root', root)
  $("#form").val(formal(form)).data('form', form)
  $("#result").text(verb(root, form))
  verbals()
})

$("#form").on("input", function () {
  var root = findRoot($("#root").val())
  var form = findForm(deformal($(this).val()), root)
  $("#result").text(verb(root, form))
})

$("#root").on("input", function () {
  var root = findRoot($(this).val())
  var form = findForm($("#form").data('form'), root)
  $("#result").text(verb(root, form))
  verbals()
})

function verbals() {
  var root = findRoot($("#root").val())
  if (!root) {
    return;
  }
  $("[data-vezn]").each(function () {
    var word = $(this).data('vezn').split(/\s+/)
    var verbal = verb(root, word.length > 1 ? (word[0] + " " + deformal(word[1]) + " " + word.slice(2).join(" ")) : word[0])
    $(this).text(verbal)
  })
}

$(".emsile").click(function () {
  verbals()
  $(".emsile-result").slideToggle()
})

// TIMER //////////////////////////

$(":input").on("focus", function () {
  if (timer) {
    clearInterval(timer)
    clearInterval(wordTimer)
    clearInterval(rootTimer)
  }
})

var wordTimer, rootTimer

var demoIndex = 0
function demoish() {
  var keys = Object.keys(roots)
  if (!keys[demoIndex]) {
    demoIndex = 0
  }
  var word = Object.keys(roots)[demoIndex]
  var root = roots[word]
  demoIndex++
  clearInterval(wordTimer)
  clearInterval(rootTimer)
  $("#word, #root").val("").removeClass('focus')
  i = 0
  wordTimer = setInterval(function () {
    $("#word").addClass("focus")
    .val(word.substr(0, i))
    .trigger('input')
    i++

    if (word.length == i-1) {
      $("#word, #root").removeClass('focus')
      clearInterval(wordTimer)
      i = 0
      setTimeout(function () {
        rootTimer = setInterval(function () {
          $("#root").addClass("focus")
          .val(root.substr(0, i))
          .trigger('input')
          i++
        }, 70)
      }, 500)
    }
  }, 70)
}

//demoish()
//var timer = setInterval(demoish, 3000);
var timer;