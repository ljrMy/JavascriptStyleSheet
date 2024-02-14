import {JSStyleSheet, CSSLocalFunction, JSSSLocalFunction} from "./JSSS@0.0.4.js"
let style=new JSStyleSheet({
    $color:"red",
    'h1':{
        color:'$color',
        '&:hover':{
            color:'green'
        }
    },
    '#demo':{
        color:'blue',
        '&::before':{
            content: JSSSLocalFunction.quote("--")
        }
    },
    '.test':{
        testColor:1
    },
    '.example':{
        animation:['test', '1s', 'infinite']
    },
    '@keyframes test':{
        '0%':{
            backgroundColor:'red'
        },
        '100%':{
            backgroundColor:'blue'
        }
    },
    testColor(argv){
        return {
            color:"white",
            backgroundColor:"black"
        }
    }
})
console.log(style)
