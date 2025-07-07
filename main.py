import FreeSimpleGUI as sg

def main():
    layout = [
        [sg.Canvas(background_color="black", size=(400, 400), key="map_canvas")]
    ]
    window = sg.Window("HotelTraveler", layout)
    while True:
        event, values = window.read(timeout=1000)
        match event:
            case sg.WIN_CLOSED:
                break
            case sg.TIMEOUT_EVENT:
                pass
        
    window.close()


if __name__ == "__main__":
    main()
