# mogura

## Extension

Outputs extension list ordered by asc to file.

`node ext ${directory path}`  
Outputs to `logs/ext-${timestamp}.txt` file.  

`node ext ${directory path} ${marker}`  
Outputs to `logs/ext-${marker}.txt` file.  

`node ext ${directory path} -n`  
Outputs no extensions to `logs/ext-${timestamp}.txt` file..  

`node ext ${directory path} -n ${marker}`  
Outputs no extensions to `logs/ext-${marker}.txt` file.  

## File path

Outputs file path list.

`node file ${directory path}`  
Outputs all file paths to `logs/file-${timestamp}.txt` file.  

`node file ${directory path} -m ${marker}`  
Outputs all file paths to `logs/file-${marker}.txt` file.  

`node file ${directory path} -n "${file name}" "${file name}"`  
Outputs file paths matches file name to `logs/file-${timestamp}.txt` file.  

`node file ${directory path} -n "${file name}" ${file name} -m ${marker}`  
`node file ${directory path} ${marker} -n "${file name}" "${file name}"`  
Outputs file paths matches file name to `logs/file-${marker}.txt` file.  

`node file ${directory path} -e ${extension} ${extension}`  
Outputs file paths matches extension to `logs/file-${timestamp}.txt` file.  

`node file ${directory path} -m ${marker} -e ${extension} ${extension}`  
`node file ${directory path} -e ${extension} ${extension} ${marker}`  
Outputs file paths matched extension to `logs/file-${marker}.txt` file.  
