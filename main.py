import io
import time
import FreeSimpleGUI as sg
import staticmap as sm
from PIL import Image

PALETTE = {
    "background": "#202020",
    "text": "#c0c0c0",
}
CANVAS_SIZE = (400, 400)
REDRAW_DEBOUNCE_TIME = 0.5  # seconds

class App:
    def __init__(self):
        self.layout = [
            [
                sg.Image(
                    key="-MAP-", 
                    expand_x=True, 
                    expand_y=True, 
                    size=CANVAS_SIZE, 
                    background_color=PALETTE["background"]
                ),
                sg.VSeparator(),
                sg.Column(
                    [],
                    key="-LOCATION-LIST-",
                    background_color=PALETTE["background"],
                )
            ],
        ]
        
        self.window = sg.Window(
            "HotelTraveler", 
            self.layout, 
            finalize=True, 
            background_color=PALETTE["background"], 
            resizable=True,
            enable_window_config_events=True)
        
        self.map_image = self.window["-MAP-"]
        self.default_zoom = 13
        self.set_location([11.112363, 42.763525])
        self.markers = []
        self.map = None
        self.add_marker(self.map_location)
        self.add_marker(self.map_location)


    def _create_marker_info(self, location, name, key):
        return sg.Text(
            f"{name} ({location[0]:.6f}, {location[1]:.6f})",
            background_color=PALETTE["background"],
            text_color=PALETTE["text"],
            key=key,
        )

    def require_map_redraw(self):
        self.map_redraw_required = time.time()

    def set_location(self, location):
        self.map_location = location
        self.require_map_redraw()

    def add_marker(self, location):
        self.markers.append(location)
        old_max_keys = self.max_keys if hasattr(self, 'max_keys') else 0
        column_layout = [[self._create_marker_info(location, f"Marker {i+1}", key=f"-marker-{i+1}-")] for i, marker in enumerate(self.markers)]
        self.max_keys = len(self.markers)
        for i in range(old_max_keys):
            key = f"-marker-{i+1}-"
            self.window[key].widget.destroy()
        self.window.extend_layout(self.window["-LOCATION-LIST-"], column_layout)
        self.require_map_redraw()
    
    def clear_markers(self):
        self.markers.clear()
        old_max_keys = self.max_keys if hasattr(self, 'max_keys') else 0
        self.max_keys = 0
        for i in range(old_max_keys):
            key = f"-marker-{i+1}-"
            self.window[key].widget.destroy()
        self.require_map_redraw()

    def update_map(self):
        map_size = self.map_image.get_size()
        self.map = sm.StaticMap(map_size[0], map_size[1])
        self.map.padding = (0,0)
        for marker in self.markers:
            self.map.add_marker(sm.CircleMarker(coord=marker, color="red", width=10))
        self.map.add_marker(sm.CircleMarker(coord=self.map_location, color="blue", width=20))
        image = self.map.render(center=self.map_location)
        with io.BytesIO() as output:
            image.save(output, format="PNG")
            data = output.getvalue()
            self.map_image.update(data=data)

    def run(self):
        while True:
            event, values = self.window.read(timeout=50)
            match event:
                case sg.WIN_CLOSED:
                    break
                case sg.WINDOW_CONFIG_EVENT:
                    self.require_map_redraw()
                case sg.TIMEOUT_EVENT:
                    if self.map_redraw_required is not None and time.time() - self.map_redraw_required > REDRAW_DEBOUNCE_TIME:
                        self.update_map()
                        self.map_redraw_required = None
        self.window.close()


if __name__ == "__main__":
    app = App()
    app.run()