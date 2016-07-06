function except(word) {
  // zelzele, vesvese...
  if (word.match(new RegExp(/([a-z]{3})\1[ae]t?/))) {
    return {
      form: deformal("fa'fa'a".replace(/a/g, word[word.length-1])),
      root: word.replace(/^(.).(.).*/, "$1$2")
    }
  }
}