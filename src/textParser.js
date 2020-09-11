const fsPromise = require('fs').promises
const Event = require('events')
const eventEmitter = new Event()

const getFilesNames = async (resourcePath) => {
  return await fsPromise.readdir(resourcePath)
}

const loadResources = async (files, resourcePath) => {
  return files.filter(fName => fName.endsWith('.txt'))
    .map(fileName => ({
      [fileName]: fsPromise.readFile(`${resourcePath}/${fileName}`, 'utf8')
    }))
    .reduce((acc, curr) => Object.assign(acc, curr))
}

const createNamesArray = async (firstNamesFile) => {
  const names = await firstNamesFile
  return names.split(/\n/)
}

/*
  splitting on double lines here also
		decreases the runtime by more than
  half
 */

const splitTextIntoArray = (text) => {
  return text.split(/\n/)
}

const isName = (word, name) => {
  return word.indexOf(name) > -1
}

const createHash = (names) => {
  return names.filter(e => e.trim())
    .map(name => ({ [name]: name }))
    .reduce((arr, current) => Object.assign(arr, current))
}

const secondCheckName = (word, hash, name) => {
  console.log(hash)
  const isInHash = word in hash
  if (isInHash) {
    return false
  } else {
    return name
  }
}

/**
 * rough proxy to check for first names,
 * The idea is to check if the next word in the line is within the names list
 * if its than exclude it from the namesArray  as its likely to be a second number
 * E.g Well Oliver Twist report to frontline
 *
 * @param wordArray
 * @param names
 * @returns {*}
 */

const checkForNames = (wordArray, names, namesHash) => {
  const namesArray = []
  wordArray.forEach((word) => {
    namesArray.push(names.filter(name => {
      const isNameBool = isName(word, name)
      if (isNameBool) {
        const nameLength = name.length
        const nextWordIndex = word.indexOf(name) + 1
        if (nextWordIndex > 1) {
          const nextWord = word.substring(nextWordIndex + nameLength)
            .split(/\s+/)
            .filter(w => w !== '')[0]
          return secondCheckName(nextWord, namesHash, name)
        } else {
          return name
        }
      }
    }))
  })
  return namesArray
    .reduce((acc, current) => acc.concat(current))
}

const prepareCheckNames = async (namesArray, text) => {
  const names = await namesArray
  const textContent = await text
  const wordArray = splitTextIntoArray(textContent).filter(e => e)
  const namesHash = createHash(names)
  return checkForNames(wordArray, names, namesHash)
}
const createCollectionOfNames = (files) => {
  const knownFiles = ['first-names.txt', 'oliver-twist.txt']
  const namesArray = createNamesArray(files[knownFiles[0]])
  return prepareCheckNames(namesArray, files[knownFiles[1]])
}

const createNameCountJSON = (names) => {
  const namesCount = {}
  names.forEach(name => {
    if (!namesCount[name]) {
      namesCount[name] = 1
    } else {
      namesCount[name] = namesCount[name] + 1
    }
  })
  return namesCount
}

let namesCountObject
const main = async () => {
  const startTime = Date.now()
  console.log('started')
  const resourcePath = 'res'
  const filesNames = await getFilesNames(resourcePath)
  const files = await loadResources(filesNames, resourcePath)
  const names = await createCollectionOfNames(files)
  namesCountObject = createNameCountJSON(names)
  eventEmitter.emit('name data ready')
  console.log('data ready time', (Date.now() - startTime) / 1000.0)
}
main()

const dataReady = () => {
  return new Promise(resolve => {
    eventEmitter.on('name data ready', () => {
      resolve()
    })
  })
}

const getNameCount = () => namesCountObject

module.exports = { dataReady, getNameCount }
