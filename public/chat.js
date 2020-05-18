const socket = io.connect(window.location.hostname);
// const socket = io.connect("http://localhost:5000");
const message = document.getElementById("message"),
    output = document.getElementById("output"),
    button = document.getElementById("button"),
    feedback = document.getElementById("feedback"),
    name = document.getElementById("dropdownMenuButton"),
    alert = document.getElementById("alert"),
    chat_window = document.getElementById("chat-window");
let image = "";
const fileInput = document.getElementById("file-input");

fileInput.addEventListener("change", (e) =>
    doSomethingWithFiles(e.target.files)
);

function doSomethingWithFiles(fileList) {
    let file = null;

    for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].type.match(/^image\//)) {
            file = fileList[i];
            break;
        }
    }

    if (file !== null) {
        console.log(URL.createObjectURL(file));
        image = URL.createObjectURL(file);
        console.log(image);
    }
}
button.addEventListener("click", () => {
    let data = {
        handle: name.textContent,
        message: message.value,
        date: new Date(),
        image: image,
    };
    message.value = "";

    socket.emit("chat", data);
});
message.addEventListener("keyup", () => {
    if (message.value !== "") socket.emit("typing", name.textContent);
    else socket.emit("typing", "stop");
});
socket.on("connect", () => {
    socket.emit("newconnection", name.textContent);
});
// socket.on("disconnect", () => {
//     socket.emit("userDisconnected", name.textContent);
// });
socket.on("userDisconnected", (data) => {
    $("#alert")
        .html(
            "<div class='alert alert-danger' role='alert'>" +
                data +
                " has left the chat" +
                "</div>"
        )
        .hide();
    window.setTimeout(function () {
        $("#alert").slideDown(500);
    }, 500);
    window.setTimeout(function () {
        $(".alert")
            .fadeTo(500, 0)
            .slideUp(500, function () {
                $(this).remove();
            });
    }, 3000);
});
socket.on("newconnection", (data) => {
    $("#alert")
        .html(
            "<div class='alert alert-success' role='alert'>" +
                data +
                " joined the chat" +
                "</div>"
        )
        .hide();
    window.setTimeout(function () {
        $("#alert").slideDown(500);
    }, 500);
    window.setTimeout(function () {
        $(".alert")
            .fadeTo(500, 0)
            .slideUp(500, function () {
                $(this).remove();
            });
    }, 3000);
});
socket.on("chat", (data) => {
    console.log(data);
    if (data.handle === name.textContent) {
        let users = "";
        data.users.forEach((item) => {
            if (item.name.trim() !== data.handle.trim())
                users += item.name + " , ";
        });
        users = users.slice(0, users.length - 3);
        output.innerHTML +=
            "<div style='display:flex;justify-content:flex-end'><div class='bg-secondary mess p-2 mr-1 m-2 rounded col-8 '><h6 class='text-warning text-capitalize'>" +
            data.handle +
            " </h6><h5> " +
            data.message +
            "</h5><div style='text-align:right'>" +
            new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "numeric",
            }).format(new Date(data.date)) +
            "</div></div>" +
            '<img src="' +
            data.image +
            '"/>' +
            "</div>";

        output.innerHTML +=
            "<div style='display:flex;justify-content:flex-end'><div class='bg-success seen pl-2 pr-2 p-1 mr-2 rounded col-8 '><strong><em>Seen by " +
            users +
            "</em></strong></div></div>";
    } else {
        feedback.innerHTML = "";
        output.innerHTML +=
            "<div style='display:flex;justify-content:flex-start'><div class='bg-dark mess p-2 ml-1 m-2 rounded col-8 '><h6 class='text-success text-capitalize'>" +
            data.handle +
            " </h6><h5> " +
            data.message +
            "</h5><div style='text-align:right'>" +
            new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "numeric",
            }).format(new Date(data.date)) +
            "</div></div>" +
            '<img src="' +
            data.image +
            '"/>' +
            "</div>";
    }
    scroll();
    // message.focus();
});
socket.on("typing", (data) => {
    console.log(data === "stop");
    if (data === "stop") {
        $(".type")
            .fadeTo(500, 0)
            .slideUp(500, function () {
                $(this).remove();
            });
    } else
        $("#feedback").html(
            "<p class='badge badge-info p-2 ml-2 type'><em>" +
                data +
                " is typing .... </em></p>"
        );

    scroll();
});
const scroll = () => {
    chat_window.scrollTop = chat_window.scrollHeight;
};
