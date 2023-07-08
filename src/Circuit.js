import React, { useEffect, useRef, useState } from 'react';

const LOGIX_THEME = 'logix-theme';

const Circuit = () => {
    const canvasRef = useRef(null);
    const gatePLaceholderRef = useRef(null);
    const widgetPlaceholderRef = useRef(null);
    const errorBoxRef = useRef(null);
    const popupRef = useRef(null);

    const [widgets, setWidgets] = useState([]);
    const [connections, setConnections] = useState([]);
    const [startConnection, setStartConnection] = useState(null);
    const [draggedElement, setDraggedElement] = useState(null);
    const [tempConnection, setTempConnection] = useState(null);

    const [andImage, setAndImage] = useState(null);
    const [orImage, setOrImage] = useState(null);
    const [notImage, setNotImage] = useState(null);
    const [xorImage, setXorImage] = useState(null);

    const [circuits, setCircuits] = useState({});

    const [currInput, setCurrInput] = useState(1);
    const [currOutput, setCurrOutput] = useState(1);

    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const andimage = new Image();
        const orimage = new Image();
        const notimage = new Image();
        const xorimage = new Image();

        andimage.src = '/gates/and.png';
        orimage.src = '/gates/or.png';
        notimage.src = '/gates/not.png';
        xorimage.src = '/gates/xor.png';

        andimage.onload = function () {
            setAndImage(andimage);
        }
        orimage.onload = function () {
            setOrImage(orimage);
        }
        notimage.onload = function () {
            setNotImage(notimage);
        }
        xorimage.onload = function () {
            setXorImage(xorimage);
        }

        const myCanvas = canvasRef.current;

        myCanvas.width = window.innerWidth;
        myCanvas.height = window.innerHeight;

        const theme = localStorage.getItem(LOGIX_THEME);
        if (theme === true || theme === 'true') {
            setDarkMode(true);
        }

    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const getColor = (color) => {
            if(darkMode) {
                return invertColor(color);
            }
            return color;
        }

        const getTempColor = (color) => {
            if(darkMode) {
                return invertColor(color) + '33';
            }
            return color + '33';
        }

        const getConnectionColor = (state) => {
            if (state === 'SET') {
                return getColor('#00ff00');
            } else if (state === 'RESET') {
                return getColor('#ff0000');
            } else {
                return getColor('#0000ff');
            }
        };

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(darkMode){
            ctx.filter = 'invert(1)';
        } else {
            ctx.filter = 'invert(0)';
        }

        // Render gates
        widgets.forEach((widget) => {
            // Render gate shape and label
            // Example:
            if (widget.type === 'GATE') {
                if (widget.gateType === 'AND') {
                    ctx.drawImage(andImage, widget.x, widget.y, widget.width, widget.height);
                } else if (widget.gateType === 'OR') {
                    ctx.drawImage(orImage, widget.x, widget.y, widget.width, widget.height);
                } else if (widget.gateType === 'NOT') {
                    ctx.drawImage(notImage, widget.x, widget.y, widget.width, widget.height);
                } else if (widget.gateType === 'XOR') {
                    ctx.drawImage(xorImage, widget.x, widget.y, widget.width, widget.height);
                } else {
                    ctx.beginPath();
                    ctx.rect(widget.x, widget.y, widget.width, widget.height);
                    ctx.fillStyle = getColor('#0000ff');
                    ctx.fill();
                    ctx.closePath();
                }
                ctx.font = '12px Arial';
                ctx.fillStyle = '#000000';
                ctx.fillText(widget.gateType, widget.x + widget.width / 2 - 12, widget.y + widget.height + 20);
            } else if (widget.type === 'INPUT') {
                ctx.beginPath();
                ctx.arc(widget.x, widget.y, widget.radius, 0, 2 * Math.PI);
                ctx.fillStyle = (widget.state === 'SET') ? getColor('#00ff00') : getColor('#ff0000');
                ctx.fill();
                ctx.closePath();
                ctx.font = '12px Arial';
                ctx.fillStyle = getColor('#ffffff');
                ctx.fillText('I', widget.x + widget.radius / 2 - 6, widget.y + widget.radius / 2);
                ctx.fillStyle = '#000000';
                ctx.fillText('Input: ' + widget.inputId, widget.x + widget.radius / 2 - 22, widget.y + widget.radius / 2 + 20);
                ctx.fillText('State: ' + (widget.state === 'SET'), widget.x + widget.radius / 2 - 22, widget.y + widget.radius / 2 + 35);
            } else if (widget.type === 'OUTPUT') {
                ctx.beginPath();
                ctx.arc(widget.x, widget.y, widget.radius, 0, 2 * Math.PI);
                ctx.fillStyle = (widget.state === 'SET') ? getColor('#00ff00') : getColor('#ff0000');
                ctx.fill();
                ctx.closePath();
                ctx.font = '12px Arial';
                ctx.fillStyle = getColor('#ffffff');
                ctx.fillText('O', widget.x + widget.radius / 2 - 9, widget.y + widget.radius / 2);
                ctx.fillStyle = '#000000';
                ctx.fillText('Output: ' + widget.outputId, widget.x + widget.radius / 2 - 22, widget.y + widget.radius / 2 + 20);
                ctx.fillText('State: ' + (widget.state === 'SET'), widget.x + widget.radius / 2 - 22, widget.y + widget.radius / 2 + 35);
            }
        });

        // Render connections
        connections.forEach((connection) => {
            const startWidget = widgets.find((widget) => widget.id === connection.startId);
            const endWidget = widgets.find((widget) => widget.id === connection.endId);
            ctx.beginPath();

            if (startWidget.type === 'GATE') {
                ctx.moveTo(startWidget.x + startWidget.width, startWidget.y + startWidget.height / 2);
            } else if (startWidget.type === 'INPUT') {
                ctx.moveTo(startWidget.x + startWidget.radius, startWidget.y);
            } else if (startWidget.type === 'OUTPUT') {
                ctx.moveTo(startWidget.x - startWidget.radius, startWidget.y);
            }

            if (endWidget.type === 'GATE') {
                if (endWidget.gateInputs === 1) {
                    ctx.lineTo(endWidget.x, endWidget.y + endWidget.height / 2);
                } else if (endWidget.gateInputs === 2) {
                    if (connection.inputNumber === 1) {
                        ctx.lineTo(endWidget.x, endWidget.y + endWidget.height / 4);
                    } else {
                        ctx.lineTo(endWidget.x, endWidget.y + 3 * endWidget.height / 4);
                    }
                }
            } else if (endWidget.type === 'INPUT') {
                ctx.lineTo(endWidget.x + endWidget.radius, endWidget.y);
            } else if (endWidget.type === 'OUTPUT') {
                ctx.lineTo(endWidget.x - endWidget.radius, endWidget.y);
            }

            ctx.strokeStyle = getConnectionColor(connection.state);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        });

        // Render temp connection
        if (tempConnection) {
            ctx.beginPath();
            ctx.moveTo(tempConnection.x, tempConnection.y);
            ctx.lineTo(tempConnection.mouseX, tempConnection.mouseY);
            ctx.strokeStyle = getTempColor('#0000ff');
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    }, [widgets, connections, tempConnection, andImage, orImage, notImage, xorImage, darkMode]);

    function invertColor(hexColor) {
        hexColor = hexColor.replace('#', '');
        var decimalColor = parseInt(hexColor, 16);
        var invertedDecimalColor = decimalColor ^ 0xFFFFFF;
        var invertedHexColor = invertedDecimalColor.toString(16);
        while (invertedHexColor.length < 6) {
          invertedHexColor = '0' + invertedHexColor;
        }
        invertedHexColor = '#' + invertedHexColor;
      
        return invertedHexColor;
    }

    useEffect(() => {
        const executeCircuit = () => {
            const inputIds = widgets.filter((widget) => widget.type === 'INPUT').map((widget) => widget.id);
            const newConnections = [...connections];
            const newWidgets = [...widgets];
            let isUpdated = false;
            let visited = {};

            while (inputIds.length > 0) {
                const currId = inputIds.shift();
                const currWidget = newWidgets.find((widget) => widget.id === currId);

                const destWidgets = circuits[currId];
                if (destWidgets && destWidgets.length > 0) {
                    for (let i = 0; i < destWidgets.length; i++) {
                        const target = destWidgets[i].dest;
                        if (visited[target]) {
                            continue;
                        }
                        inputIds.push(target);

                        const targetWidget = newWidgets[target - 1];
                        const connectionIndex = destWidgets[i].connectionIndex;

                        if (targetWidget.type === 'OUTPUT' && currWidget.state) {
                            newWidgets[targetWidget.id - 1].state = currWidget.state;
                            visited[target] = true;
                        } else if (targetWidget.type === 'GATE') {
                            if (targetWidget.gateInputs === 1) {
                                if (targetWidget.gateType === 'NOT') {
                                    const output = (currWidget.state === 'SET') ? 'RESET' : 'SET';
                                    newWidgets[targetWidget.id - 1].state = output;
                                    newWidgets[targetWidget.id - 1].input1 = output === 'SET' ? 1 : 0;
                                }
                                visited[target] = true;
                            } else if (targetWidget.gateInputs === 2) {
                                if (targetWidget.input1 === null) {
                                    const inp1 = (currWidget.state === 'SET') ? 1 : 0;
                                    newWidgets[targetWidget.id - 1].input1 = inp1;
                                } else {
                                    newWidgets[targetWidget.id - 1].input2 = (currWidget.state === 'SET') ? 1 : 0;
                                    if (targetWidget.gateType === 'AND') {
                                        newWidgets[targetWidget.id - 1].state = (newWidgets[targetWidget.id - 1].input1 === 1 && newWidgets[targetWidget.id - 1].input2 === 1) ? 'SET' : 'RESET';
                                    } else if (targetWidget.gateType === 'OR') {
                                        newWidgets[targetWidget.id - 1].state = (newWidgets[targetWidget.id - 1].input1 === 1 || newWidgets[targetWidget.id - 1].input2 === 1) ? 'SET' : 'RESET';
                                    } else if (targetWidget.gateType === 'XOR' && newWidgets[targetWidget.id - 1].input1 !== null && newWidgets[targetWidget.id - 1].input2 !== null) {
                                        newWidgets[targetWidget.id - 1].state = (newWidgets[targetWidget.id - 1].input1 === newWidgets[targetWidget.id - 1].input2) ? 'RESET' : 'SET';
                                    }
                                    newWidgets[targetWidget.id - 1].input1 = null;
                                    newWidgets[targetWidget.id - 1].input2 = null;
                                    visited[target] = true;
                                }
                            }
                        }
                        if (newConnections[connectionIndex].state !== currWidget.state) {
                            isUpdated = true;
                        }
                        newConnections[connectionIndex].state = currWidget.state;
                    }
                }
            }
            if (isUpdated) {
                setWidgets(newWidgets);
                setConnections(newConnections);
            }
        };
        executeCircuit();
    }, [circuits, widgets, connections]);

    const addGate = (type, x, y) => {
        const newGate = {
            id: widgets.length + 1,
            type: 'GATE',
            gateType: type,
            gateInputs: getGateInputs(type),
            x: x,
            y: y,
            width: 50,
            height: 50,
            state: 'RESET',
            input1: null,
            input2: null,
        };
        setWidgets((prevWidget) => [...prevWidget, newGate]);
    };

    const addInput = (x, y) => {
        const newInput = {
            id: widgets.length + 1,
            x: x,
            y: y,
            height: 10,
            width: 10,
            type: 'INPUT',
            state: 'RESET',
            radius: 10,
            inputId: currInput,
        };
        setWidgets((prevWidget) => [...prevWidget, newInput]);
        setCurrInput(currInput + 1);
    };

    const addOutput = (x, y) => {
        const newOutput = {
            id: widgets.length + 1,
            x: x,
            y: y,
            height: 10,
            width: 10,
            type: 'OUTPUT',
            state: 'RESET',
            radius: 10,
            outputId: currOutput,
        };
        setWidgets((prevWidget) => [...prevWidget, newOutput]);
        setCurrOutput(currOutput + 1);
    };

    const getGateInputs = (type) => {
        if (type === 'NOT') {
            return 1;
        } else {
            return 2;
        }
    };

    const refactorConnections = (currConnections, id, connectionNumber) => {
        connectionNumber = connectionNumber || 1;
        let newConnections = currConnections;
        const existingConnection = currConnections.find((conn) => conn.endId === id && conn.inputNumber === connectionNumber);
        if (existingConnection) {
            // Remove existing connection
            newConnections = newConnections.filter((conn) => conn.endId !== id || conn.inputNumber !== connectionNumber);
        }
        // if (startConnection && startConnection.type !== 'INPUT') {
        //     newConnections = newConnections.filter((conn) => conn.startId !== startConnection.id);
        // }
        newConnections = [
            ...newConnections,
            {
                startId: startConnection.id,
                endId: id,
                inputNumber: connectionNumber,
                state: 'RESET',
            }
        ]
        return newConnections;
    };

    const validateConnection = (startId, endId) => {
        if (endId !== -1 && startId === endId) {
            return {
                isValid: false,
            }
        }
        const endWidget = widgets.find((widget) => widget.id === endId);
        const startWidget = widgets.find((widget) => widget.id === startId);
        if (endWidget && endWidget.type === 'INPUT') {
            return {
                isValid: false,
                message: 'Cannot connect output to input'
            }
        } else if (startWidget && startWidget.type === 'OUTPUT') {
            return {
                isValid: false,
                message: 'Cannot connect output to input'
            }
        }
        return {
            isValid: true
        };
    }

    const showErrorIfInvalid = (validation) => {
        if (!validation.isValid) {
            if (validation.message) {
                showError(validation.message);
            }
            setTempConnection(null);
            setStartConnection(null);
            return true;
        }
        return false;
    }

    const getCicuitsFromConnections = (connections) => {
        const circuits = {};
        // circuits are in form of src id -> dest id
        connections.forEach((connection, index) => {
            if (connections.startId === -1) {
                return;
            }
            if (circuits[connection.startId]) {
                circuits[connection.startId].push({
                    'dest': connection.endId,
                    'connectionIndex': index,
                });
            } else {
                circuits[connection.startId] = [{
                    'dest': connection.endId,
                    'connectionIndex': index,
                }];
            }
        });
        return circuits;
    };

    const endConnection = (id, type, connectionNumber) => {
        if (startConnection) {
            const validation = validateConnection(startConnection.id, id);
            if (showErrorIfInvalid(validation)) return;
            const newConnections = refactorConnections(connections, id, connectionNumber);
            setCircuits(getCicuitsFromConnections(newConnections));
            setConnections(newConnections);
            setStartConnection(null);
            setTempConnection(null);
        } else {
            const validation = validateConnection(id, -1);
            if (showErrorIfInvalid(validation)) return;
            setStartConnection({ id: id, type: type });
        }
    };

    const mouseMoveHandler = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX = event.clientX;
        let clientY = event.clientY;

        if (event.type === 'touchmove') {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        if (startConnection) {
            const startWidget = widgets.find((widget) => widget.id === startConnection.id);
            setTempConnection({
                x: startWidget.x + startWidget.width,
                y: startWidget.y + startWidget.height / 2,
                mouseX: mouseX,
                mouseY: mouseY,
            });
        }
        if (draggedElement) {
            if (isGate(draggedElement) && gatePLaceholderRef.current && widgetPlaceholderRef.current.style) {
                gatePLaceholderRef.current.src = `/gates/${draggedElement.toLowerCase()}.png`;
                gatePLaceholderRef.current.style.display = 'block';
                gatePLaceholderRef.current.style.top = mouseY - 25 + 'px';
                gatePLaceholderRef.current.style.left = mouseX - 25 + 'px';
            } else if (widgetPlaceholderRef.current && gatePLaceholderRef.current.style) {
                widgetPlaceholderRef.current.style.display = 'block';
                widgetPlaceholderRef.current.style.top = mouseY - 10 + 'px';
                widgetPlaceholderRef.current.style.left = mouseX - 10 + 'px';
            }
        }
    }

    const getClickedWidget = (mouseX, mouseY) => {
        return widgets.find(
            (widget) => {
                if (widget.type === 'GATE') {
                    return mouseX >= widget.x &&
                        mouseX <= widget.x + widget.width &&
                        mouseY >= widget.y &&
                        mouseY <= widget.y + widget.height
                } else if (widget.type === 'INPUT') {
                    return Math.sqrt((mouseX - widget.x) ** 2 + (mouseY - widget.y) ** 2) <=
                        widget.radius
                } else if (widget.type === 'OUTPUT') {
                    return Math.sqrt((mouseX - widget.x) ** 2 + (mouseY - widget.y) ** 2) <=
                        widget.radius
                } else {
                    return false;
                }
            }
        );
    };

    const handleDragStartOrEnd = (event) => {
        const rect = event.target.getBoundingClientRect();
        let clientX = event.clientX;
        let clientY = event.clientY;

        if (event.type === 'touchend') {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else if (event.type === 'touchstart') {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const clickedWidget = getClickedWidget(mouseX, mouseY);

        if (clickedWidget) {
            if (clickedWidget.type === 'GATE') {
                if (clickedWidget.gateInputs === 2) {
                    if (mouseY < clickedWidget.y + clickedWidget.height / 2) {
                        endConnection(clickedWidget.id, clickedWidget.type, 1);
                    } else {
                        endConnection(clickedWidget.id, clickedWidget.type, 2);
                    }
                } else {
                    endConnection(clickedWidget.id, clickedWidget.type);
                }
            } else {
                endConnection(clickedWidget.id, clickedWidget.type);
            }
            return;
        }
        setStartConnection(null);
        setTempConnection(null);
    };

    const handleElementDragStart = (event, element) => {
        setDraggedElement(element);
    };

    const handleElementDragEnd = (event) => {
        if (draggedElement) {
            const rect = canvasRef.current.getBoundingClientRect();
            const offset = isGate(draggedElement) ? 25 : 0;
            let clientX = event.clientX;
            let clientY = event.clientY;

            if (event.type === 'touchend') {
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            }
            const mouseX = clientX - rect.left - offset;
            const mouseY = clientY - rect.top - offset;

            switch (draggedElement) {
                case 'AND':
                    addGate('AND', mouseX, mouseY);
                    break;
                case 'OR':
                    addGate('OR', mouseX, mouseY);
                    break;
                case 'NOT':
                    addGate('NOT', mouseX, mouseY);
                    break;
                case 'XOR':
                    addGate('XOR', mouseX, mouseY);
                    break;
                case 'INPUT':
                    addInput(mouseX, mouseY);
                    break;
                case 'OUTPUT':
                    addOutput(mouseX, mouseY);
                    break;
                default:
                    break;
            }
            setDraggedElement(null);
        } else {
            handleDragStartOrEnd(event);
        }
        gatePLaceholderRef.current.style.display = 'none';
        widgetPlaceholderRef.current.style.display = 'none';
    };

    const isGate = (type) => {
        return type === 'AND' || type === 'OR' || type === 'NOT' || type === 'XOR';
    };

    const handleInputClick = (event) => {
        const rect = event.target.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const clickedWidget = getClickedWidget(mouseX, mouseY);
        if (clickedWidget && clickedWidget.type === 'INPUT') {
            const newWidgets = widgets.map((widget) => {
                if (widget.id === clickedWidget.id) {
                    if (widget.state === 'SET') {
                        return {
                            ...widget,
                            state: 'RESET',
                        };
                    } else {
                        return {
                            ...widget,
                            state: 'SET',
                        };
                    }
                } else {
                    return widget;
                }
            });
            setWidgets(newWidgets);
        }
    };

    const showError = (message) => {
        errorBoxRef.current.innerText = message;
        errorBoxRef.current.style.display = 'block';
        errorBoxRef.current.classList.remove('hideErrorMessage');
        errorBoxRef.current.classList.add('showErrorMessage');
        setTimeout(() => {
            errorBoxRef.current.classList.remove('showErrorMessage');
            errorBoxRef.current.classList.add('hideErrorMessage');
            setTimeout(() => {
                errorBoxRef.current.style.display = 'none';
            }, 1000);
        }, 2000);
    };

    const handleClickOnMenu = (event) => {
        event.stopPropagation();
        showError('Please drag the widget to add it to the circuit');
    };

    const showPopup = () => {
        if (popupRef && popupRef.current && popupRef.current.style) {
            popupRef.current.style.display = 'flex';
        }
    };

    const hidePopup = () => {
        if (popupRef && popupRef.current && popupRef.current.style) {
            popupRef.current.style.display = 'none';
        }
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        localStorage.setItem(LOGIX_THEME, !darkMode);
    };

    return (
        <div 
            className={`circuit ${darkMode ? 'dark': 'light'}`}
            onTouchMove={mouseMoveHandler}
        >
            <canvas
                ref={canvasRef}
                onMouseDown={handleDragStartOrEnd}
                onMouseUp={handleElementDragEnd}
                onClick={handleInputClick}
                onMouseMove={mouseMoveHandler}
                onTouchStart={handleDragStartOrEnd}
                onTouchEnd={handleElementDragEnd}
            />
            <div className="circuit-controls">
                <div
                    className='widget-btn'
                    onMouseDown={(event) => handleElementDragStart(event, 'AND')}
                    onMouseUp={handleElementDragEnd}
                    onTouchStart={(event) => handleElementDragStart(event, 'AND')}
                    onTouchEnd={handleElementDragEnd}
                    onClick={handleClickOnMenu}
                >
                    <img draggable="false" className='btn-img' src="/gates/and.png" alt="AND" />
                    AND Gate
                </div>
                <div
                    className='widget-btn'
                    onMouseDown={(event) => handleElementDragStart(event, 'OR')}
                    onMouseUp={handleElementDragEnd}
                    onTouchStart={(event) => handleElementDragStart(event, 'OR')}
                    onTouchEnd={handleElementDragEnd}
                >
                    <img draggable="false" className='btn-img' src="/gates/or.png" alt="OR" />
                    OR Gate
                </div>
                <div
                    className='widget-btn'
                    onMouseDown={(event) => handleElementDragStart(event, 'NOT')}
                    onMouseUp={handleElementDragEnd}
                    onTouchStart={(event) => handleElementDragStart(event, 'NOT')}
                    onTouchEnd={handleElementDragEnd}
                >
                    <img draggable="false" className='btn-img' src="/gates/not.png" alt="NOT" />
                    NOT Gate
                </div>
                <div
                    className='widget-btn'
                    onMouseDown={(event) => handleElementDragStart(event, 'XOR')}
                    onMouseUp={handleElementDragEnd}
                    onTouchStart={(event) => handleElementDragStart(event, 'XOR')}
                    onTouchEnd={handleElementDragEnd}
                >
                    <img draggable="false" className='btn-img' src="/gates/xor.png" alt="XOR" />
                    XOR Gate
                </div>

                <div
                    className='widget-btn'
                    onMouseDown={(event) => handleElementDragStart(event, 'INPUT')}
                    onMouseUp={handleElementDragEnd}
                    onTouchStart={(event) => handleElementDragStart(event, 'INPUT')}
                    onTouchEnd={handleElementDragEnd}
                >
                    <div className='btn-img btn-cus'>I</div>
                    Input
                </div>

                <div
                    className='widget-btn'
                    onMouseDown={(event) => handleElementDragStart(event, 'OUTPUT')}
                    onMouseUp={handleElementDragEnd}
                    onTouchStart={(event) => handleElementDragStart(event, 'OUTPUT')}
                    onTouchEnd={handleElementDragEnd}
                >
                    <div className='btn-img btn-cus'>O</div>
                    Output
                </div>
            </div>

            <div
                className='widget-btn help-btn btn-right'
                onClick={showPopup}
            >
                <div className='rippleContainer'>
                    <div className='rippleEffect'>
                    </div>
                    <div className='btn-img'>?</div>
                </div>
            </div>
            <div
                className='widget-btn help-btn btn-left'
                onClick={toggleTheme}
            >
                <div className='rippleContainer'>
                    <div className='rippleEffect'>
                    </div>
                    <div className='btn-img'>{darkMode ? (
                        <img draggable="false" className='btn-img' src="/imgs/sun.png" alt="Light" />
                    ): (
                        <img draggable="false" className='btn-img' src="/imgs/moon.png" alt="Dark" />
                    )}</div>
                </div>
            </div>
            <div className='popup' ref={popupRef}>
                <div className='popup-content'>
                    <div className='popup-header'>
                        <h3>Getting Started</h3>
                        <div className='close-btn' onClick={hidePopup}>X</div>
                    </div>
                    <div className='popup-body'>
                        <p>
                            <b>1.</b> Drag and drop the gates and inputs to the canvas.
                        </p>
                        <p>
                            <b>2.</b> Connect the gates and inputs to form a circuit. To connect the cicuit draw a line from the source to the destination.
                            <br />
                            The source can be an input or a gate and the destination can be a gate or an output.
                            <br />
                            <b>NOTE: You can not draw the connections from destination to source</b>
                        </p>
                        <p>
                            <b>3.</b> Click on the inputs to change their state.
                        </p>
                        <p>
                            <b>4.</b> Green color indicates that the output is set to 1.
                        </p>
                        <p>
                            <b>5.</b> Red color indicates that the output is set to 0.
                        </p>
                    </div>
                </div>
            </div>
            <img ref={gatePLaceholderRef} draggable="false" className='placeholder placeholder-gate' src="/gates/and.png" alt="Placeholder" />
            <div ref={widgetPlaceholderRef} className='placeholder btn-cus'></div>
            <div ref={errorBoxRef} className="error-message hideErrorMessage"></div>
            <div className="copy-right">&copy; <a rel='noreferrer' href="https://kaustubhvats-portfolio.netlify.app" target='_blank'>Kaustubh Vats</a></div>
        </div>
    );
};

export default Circuit;