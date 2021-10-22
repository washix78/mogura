# mogura

These are tools that search and move files and symbolic links.  
(Only Mac.)  

`mogura` means "Mole" in japanese.  

* info: Outputs file count, symbolic link count, extensions.
* unique: Moves duplicate digest file or symbolic link.
* extension: Groups file or symbolic link by extension.
* comp: Moves duplicated file or symbolic link between base directory and target directory.
* header: Outputs some byte from file beginning.
* image: Moves files to directory named "BMP", "GIF", "JPG", "PNG", "binary.d". 

## Log file

Each tools output log file to `logs` directory.  
Log file name is formated with `${timestamp}_${tool name}_${sign}.json`.  

## Destination directory

`unique`, `comp` moves file and symbolic link to "destination directory".  
Tools makes "destination directory" at `extra` directory.  
"Destination directory" name format is `${timestamp}_${tool name}_${sign}`.

## info

```
node info ${directory path} ${options}
```

### options

```
-s ${sign}
```

## unique

```
node unique ${directory path} ${options}
```

### options

```
-s ${sign}
```

```
-F
```

## extension

```
node extension ${directory path} ${options}
```

### options

```
-s ${sign}
```

```
-F
```

## comp

```
node comp ${base directory path} ${target directory path} ${options}
```

### options

```
-s ${sign}
```

```
-F
```

## header

```
node header ${directory path} ${options}
```

### options

```
-s ${sign}
```

```
-n ${byte count}
```

## image

```
node image ${directory path} ${options}
```

### options

```
-s ${sign}
```

```
-F
```