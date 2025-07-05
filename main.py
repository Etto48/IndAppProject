import FreeSimpleGUI as sg

def main():
    layout = [
        [sg.Text("Hello, World!")],
        [sg.Button("OK"), sg.Button("Cancel")]
    ]
    window = sg.Window("Simple GUI", layout)
    while True:
        event, values = window.read(timeout=1000)
        match event:
            case sg.WIN_CLOSED:
                break
            case "Cancel":
                break
            case "OK":
                sg.popup("You clicked OK!")
            case sg.TIMEOUT_EVENT:
                # TODO: update GUI
                pass
        
    window.close()


if __name__ == "__main__":
    main()
