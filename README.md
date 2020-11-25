# mogura

## Extension

Mogura outputs extension list ordered by asc to file.

`node ext ${directory path}`  
`node ext ${directory path} -m ${marker}`  
`node ext ${directory path} -n`  

Mogura outputs extensions to `logs/ext-${timestamp}.txt` file.  
If contains `-m ${marker}`, outputs `logs/ext-${marker}.txt` file.  
If contains `-n`, outputs file name has no extension to file.  

### Output format

TSV (tab separated values).

```
${extension or file name} ${file count}
```

## File path

Outputs file path list.

### Basic

Outputs all file paths in ${directory path} directory to `logs/file-${timestamp}.txt` file.  
`node file ${directory path}`  

### Option

`node file ${basic} -m ${marker}`  
`node file ${basic} -e ${extension} ${extension}`  
`node file ${basic} -n "${file name}" "${file name}"`  
`node file ${basic} -ef ${extension list path}`  
`node file ${basic} -nf ${file name list path}`  
`node file ${basic} -mx ${minimum file size}`  

If contains `-m ${marker}`, outputs `logs/file-${marker}.txt` file.  
If contains `-e ${extension} ${extension}`, outputs file paths matched extensions to file.  
Else if contains `-n "${file name}" "${file name}"`, outputs file paths matched file name to file.  
Else if contains `-ef ${extension list path}`, outputs file paths matched extensions on `${extension list path}` file.  
Else if contains `-nf ${file name list path}`, outputs file paths matched file names on `${file name list path}` file.  
Else if contains `-mx ${maximum file size}`, outputs file paths are to ${maximum} size. (1, 2k, 3m, 4g)

## Information

Outputs file informations.

### Basic

Outputs informations of file in ${directory path} directory.  
`node info -d ${directory path}`  

Outputs information of file written at ${file path list path} file.  
`node info -f ${file path list path}  `

### Option

`node ${basic} -m ${marker}`  
If contains `-m ${marker}`, outputs `logs/file-${marker}.txt` file.  

### Output format

Mogura outputs file informations that are seperated by tab to file.  
Information are unique or not unique ("#"), path, size, md5 digest value, sha1 digest value, birth time and modify time.  

```
${"#" or space} ${path} ${size} ${md5 digest value} ${sha1 digest value} ${birth time} ${modify time}
```
