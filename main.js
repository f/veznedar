var roots = window.roots || []
var exceptions = window.exceptions || []

function std(str) {
  if (!str) {
    return ""
  }
  return str
  .toLocaleLowerCase()
  .replace(/[^a-zA-ZıİüÜöÖşŞğĞçÇ\(\)âîû\s\'\"\!]/g, "")
}

function formal(form) {
  return std(form)
  .replace(/x/g, "f")
  .replace(/q/g, "'")
  .replace(/w/g, "l")
  .replace(/!/g, "l")
}

function deformal(form) {
  return std(form)
  .replace(/f/g, "x")
  .replace(/\'/g, "q")
  .replace(/l/, "w")
  .replace(/l/g, "!")
}

function verb(root, form) {
  root = root.length > 3 ? findRoot(root) : root
  var word = std(form)
  .replace(/x/g, root[0]||"")
  .replace(/w/g, root[2]||"")
  .replace(/q/g, root[1]||"")
  .replace(/!/g, root[3]||"")
  word = word
    .replace(/\(.\)/g, "")
    .replace(/[aeiouıüö]([aeiouıüö])/g, "$1")
  return std(word)
}

function findRoot(word) {
  var exc = except(word)
  if (exc) {
    return exc.root
  }
  var root = std(word)

  if (root.length > 4) {

    var possibleRoot = root.replace(/[aeiouıüö]/g, "")
    if (possibleRoot.length == 3) {
      return possibleRoot
    }

    root = root.replace(/^in/, "")
    .replace(/^[iı]st[iı]|^m?[üu]st/, "")
    .replace(/^m[aeiouıüö]|^t[aeiouıüö]/, "")
    .replace(/yy?[ae]t$/, "")
    .replace(/[ae]t$|tun$/, "")
  }

  root = root.replace(/[aeiouıüö]/g, "")

  if (root.length >= 4) {
    root = root.replace(/.*(.)(.)\2(.)/g, "$1$2$3")
    if (root.length >= 4 && root[1] == "t") {
      var _root = root[0]+root[2]+root[3]
      root = _root
    }
  }

  var wovel = word.match(/[aeiouıüö]/)
  if (root.length == 2 && wovel) {
    root = wovel[0]+root[0]+root[1]
  }
  return root
}

function findForm(word, root) {
  var exc = except(word)
  if (exc) {
    return exc.form
  }

  root = std(root)
  var form = std(word).split("").reverse().join("")
  .replace(new RegExp(root[0]), "x")
  .replace(new RegExp(root[1]+root[1]), "qq")
  .replace(new RegExp("(.)"+root[1]+"(.)"), "$1q$2")
  .replace(new RegExp(root[2]), "w")

  if (root.length > 3) {
    form = form.replace(new RegExp(root[3]), "!")
  }

  var wovel = root && root[0].match(/[aeiouıüö]/)
  if (wovel) {
    form = form.replace(/x/g, "x)"+wovel[0]+"(")
  }
  return form.split("").reverse().join("")
}

$("#word").on("input", function () {
  var root = findRoot($(this).val())
  var form = findForm($(this).val(), root)
  if ($(this).val() == "") {form = ""; root = ""}
  $("#root").val(root).data('root', root)
  $("#form").val(formal(form)).data('form', form)
  $("#result").text(verb(root, form))

  $(".form-d, .form-d2").text(formal(form) || "vezin")
  $(".root-d").text(root || "kök")
  $(".word-d, .word-d2").text($(this).val() || "...")
  $(".root-d2").text(root || "...")
  //verbals()
})

$("#form").on("input", function () {
  var root = findRoot($("#root").val())
  var form = findForm(deformal($(this).val()), root)
  $("#result").text(verb(root, form))

  $(this).data('form', form)
  $(".form-d2").text(formal(form) || "vezin")
})

$("#root").on("input", function () {
  var root = findRoot($(this).val())
  var form = findForm($("#form").data('form'), root)
  $("#result").text(verb(root, form))

  $(".word-d2").text($(this).val() || "...")
  $(".root-d2").text(root || "...")
  //verbals()
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
  if ($("#root").val() != "") {
    $(".emsile-result").slideToggle()
  }
})

// TIMER //////////////////////////

$(":input").on("focus", function () {
  if (timer && demoIndex > 0) {
    localStorage.setItem('examplesDisabled', 'true')
    $(".ornekler").removeClass('shown').text("örneklere devam et")
    $("#word, #root").removeClass('focus')
    clearInterval(timer)
    clearInterval(wordTimer)
    clearInterval(rootTimer)
  }
})

$(":input").on("keyup", function () {
  location.hash = ([
    encodeURIComponent($("#word").val()),
    encodeURIComponent($("#root").val()),
    encodeURIComponent($("#form").val())]
    .join(":")
    .replace(/^:+|:+$/, ""))
})

var timer, wordTimer, rootTimer

var demoIndex = 0
var keys = Object.keys(roots).sort(function() {
  return 0.5 - Math.random()
});

function demoish() {
  if (!keys[demoIndex]) {
    demoIndex = 0
  }
  var word = keys[demoIndex]
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

function start() {
  if (!localStorage.getItem('examplesDisabled')) {
    demoish()
    timer = setInterval(demoish, 5000)
    $(".ornekler").addClass('shown').text("örnekleri gizle")
    return true
  }
  $(".ornekler").removeClass('shown').text("örnekleri göster")
  return false
}

$(".ornekler").click(function () {
  if (!localStorage.getItem('examplesDisabled')) {
    localStorage.setItem('examplesDisabled', 'true')
    clearInterval(timer)
    clearInterval(wordTimer)
    clearInterval(rootTimer)
    $(":input").val("")
    $("#result").text("")
    $(".emsile-result").hide()
    $(".ornekler").removeClass('shown').text("örnekleri göster")
  } else {
    localStorage.removeItem('examplesDisabled')
    start()
  }
})

$.fn.write = function (speed, callback) {
  var i = 0
  var $this = $(this)
  var value = $this.val()
  $this.val("")
  var timer = setInterval(function () {
    $this.addClass("focus").val(value.substr(0, i)).trigger('input')
    i++
    if (value.length == i-1) {
      $this.removeClass('focus')
      clearInterval(timer)
      if (callback) setTimeout(callback, 500)
    }
  }, speed||70)
}

function main() {
  if (location.hash != "") {
    var words = location.hash.replace(/^#/, "").split(":")
    if (words[0]) $("#word").val(decodeURIComponent(words[0])).trigger('input').write(100, function () {
    if (words[1]) $("#root").val(decodeURIComponent(words[1])).trigger('input').write(100, function () {
    if (words[2]) $("#form").val(decodeURIComponent(words[2])).trigger('input').write(100)
    })
    })
  } else {
    start()
  }
}

main()
